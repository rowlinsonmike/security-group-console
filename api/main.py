from fastapi import FastAPI, HTTPException, Depends
from dotenv import load_dotenv,find_dotenv
from rethinkdb import RethinkDB
import traceback
from pydantic import BaseModel
from typing import Union
import json
import aws
import os
import json
import util

#load env
load_dotenv(find_dotenv())  

from auth_handler import JWTBearer, signJWT, decodeJWT

rethink_host = os.getenv('RETHINKDB',"localhost")

r = RethinkDB()


app = FastAPI()

# initial setup of db
conn = r.connect(host=rethink_host, port=28015)
# create db
try:
    r.db_create("sgc").run(conn)
except:
    ...
# create tables
tables = ["sgp", "accounts", "users"]
for t in tables:
    try:
        r.db("sgc").table_create(t).run(conn)
    except:
        ...
conn.close()

# ensure admin user exists
conn = r.connect(host=rethink_host, port=28015, db="sgc")
users = [x for x in r.table("users").filter({"email": "admin@sgc.com"}).run(conn)]
if not len(users):
    value = (
        r.table("users")
        .insert(
            {
                "email": "admin@sgc.com",
                "password": util.salt_password(os.getenv("ADMIN_PASSWORD")),
            }
        )
        .run(conn)
    )


# check if user exists
def check_user(user):
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    users = [x for x in r.table("users").filter({"email": user.get("email")}).run(conn)]
    if not len(users):
        return False
    existing_user = users[0]
    if existing_user.get("password") != util.salt_password(user.get("password")):
        return False
    conn.close()
    return existing_user


# models
class SGP(BaseModel):
    name: Union[str, None] = None
    account: Union[str, None] = None
    region: Union[str, None] = None
    vpc: Union[str, None] = None
    html: Union[str, None] = None
    config: Union[dict, None] = None


class User(BaseModel):
    email: Union[str, None] = None
    password: Union[str, None] = None


@app.post("/api/login")
async def login(user: User):
    user = json.loads(user.json())
    existing = check_user(user)
    if not existing:
        raise HTTPException(status_code=403, detail="Incorrect Credentials")
    return {"jwt": signJWT(user.get("id")), "email": existing.get("email"),"id":existing.get("id")}


@app.post("/api/confirm_auth", dependencies=[Depends(JWTBearer())])
async def confirm_auth():
    return {"success": True}


@app.post("/api/users", dependencies=[Depends(JWTBearer())])
async def create_user(user: User):
    user = json.loads(user.json())
    # salt password
    user["password"] = util.salt_password(user["password"])
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    value = r.table("users").insert(user).run(conn)
    conn.close()
    return {"id": value.get("generated_keys")[0]}


@app.get("/api/users", dependencies=[Depends(JWTBearer())])
async def get_users():
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    # Select the database and table
    table = r.table("users")
    users = [
        {"id": d.get("id"), "email": d.get("email")}
        for d in table.run(conn)
        if d.get("email") != "admin@sgc.com"
    ]
    conn.close()
    return users


@app.delete("/api/users/{user}", dependencies=[Depends(JWTBearer())])
async def delete_user(user):
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    r.table("users").get(user).delete().run(conn)
    conn.close()
    return {"user": user}


@app.get("/api/metrics", dependencies=[Depends(JWTBearer())])
async def get_metrics():
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    # Select the database and table
    stats = {
        "policies": 0,
        "accounts": {},
        "regions": {},
        "egress_rules": 0,
        "ingress_rules": 0,
        "security_groups": 0,
    }
    for x in r.table("sgp").run(conn):
        stats["policies"] += 1
        account = x.get("account")
        stats["accounts"][account] = stats["accounts"].get(account, 0)
        stats["accounts"][account] += 1
        region = x.get("region")
        stats["regions"][region] = stats["regions"].get(region, 0)
        stats["regions"][region] += 1
        stats["security_groups"] += len(x.get("config").keys())
        stats["egress_rules"] += sum(
            [
                len([i for i in y.get("egress") for z in i[0].split(",")])
                for y in x.get("config").values()
            ]
        )
        stats["ingress_rules"] += sum(
            [
                len([i for i in y.get("ingress") for z in i[0].split(",")])
                for y in x.get("config").values()
            ]
        )
    conn.close()
    return stats


@app.get("/api/sgp", dependencies=[Depends(JWTBearer())])
async def get_sgp():
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    # Select the database and table
    table = r.table("sgp")
    sgp = [d for d in table.run(conn)]
    conn.close()
    return sgp


@app.get("/api/sgp/{sgp}", dependencies=[Depends(JWTBearer())])
async def get_one_sgp(sgp):
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    doc = r.table("sgp").get(sgp).run(conn)
    conn.close()
    return {"sgp": doc}


@app.post("/api/sgp", dependencies=[Depends(JWTBearer())])
async def create_sgp(sgp: SGP):
    sgp = json.loads(sgp.json())
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    value = r.table("sgp").insert(sgp).run(conn)
    conn.close()
    return {"id": value.get("generated_keys")[0]}


@app.post("/api/sgp/{sgp_id}/deploy", dependencies=[Depends(JWTBearer())])
async def deploy_sgp(sgp_id):
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    doc = r.table("sgp").get(sgp_id).run(conn)
    region = doc.get("region")
    config = doc.get("config")
    creds = aws.assume_role(doc.get("account"), region)
    # collect security groups that currently exist
    existing = aws.get_aws_sg(doc.get("name"), region, creds)
    ## get current attached instances
    instances = aws.get_ec2_instances(list(existing.values()), region, creds)
    # create security groups that don't exist
    for config_id, config_value in config.items():
        if config_value.get("sg_id"):
            continue
        config[config_id]["sg_id"] = aws.create_security_group(
            doc.get("name"),
            config_id,
            config_value.get("name"),
            doc.get("vpc"),
            region,
            creds,
        )
        existing[config_id] = config[config_id]["sg_id"]
    # get rules of existing security gruops
    rules = aws.get_aws_sg_rules(list(existing.values()), region, creds)
    # delete security groups that don't exist in config
    for id, sg_id in existing.items():
        if id in config:
            continue
        # delete any rules referencing security group
        for rule in [json.dumps(x) for x in rules]:
            if sg_id in rule:
                rule = json.loads(rule)
                if rule.get("IsEgress"):
                    aws.remove_egress(rule, region, creds)
                else:
                    aws.remove_ingress(rule, region, creds)
        # delete any attachments to instances
        for i in instances:
            if sg_id in i.get("SecurityGroups"):
                aws.remove_sg_from_instance(sg_id, i.get("InstanceId"), region, creds)
        # delete security group
        aws.delete_sg(sg_id, doc.get("region"), creds)
    # modify rules
    RULE_MAP = {
        "ANY": "-1",
        "ICMP": "icmp",
    }
    for config_id, config_value in config.items():
        defined_rules = []
        config[config_id]["rules"] = config_value.get(
            "rules", {"ingress": {}, "egress": {}}
        )
        for ports, ip, _ in config_value.get("ingress"):
            ip = ip if util.confirm_cidr(ip) else config[ip].get("sg_id")
            for p in map(lambda x: x.strip(), ports.split(",")):
                try:
                    proto, port = p.split(" ")
                except:
                    proto = RULE_MAP[p.strip()]
                    port = None
                rule_slug = "{}{}{}".format(proto, port, ip)
                defined_rules.append(rule_slug)
                if rule_slug in config[config_id]["rules"]["ingress"]:
                    continue
                rule = aws.add_ingress(
                    config_value.get("sg_id"), proto, port, ip, region, creds
                )
                config[config_id]["rules"]["ingress"][rule_slug] = rule
        # clean up orphaned rules
        for k, v in config[config_id]["rules"]["ingress"].items():
            if k not in defined_rules:
                try:
                    rule = [r for r in rules if r.get("SecurityGroupRuleId") == v][0]
                    print("delete", rule.get("SecurityGroupRuleId"))
                    aws.remove_ingress(rule, region, creds)
                except:
                    ...
        # clean up abandoned rules
        for rule in [
            x
            for x in rules
            if not x.get("IsEgress") and x.get("GroupId") == config_value.get("sg_id")
        ]:
            if rule.get("SecurityGroupRuleId") not in list(
                config[config_id]["rules"]["ingress"].values()
            ):
                aws.remove_ingress(rule, region, creds)
        for ports, ip, _ in config_value.get("egress"):
            ip = ip if util.confirm_cidr(ip) else config[ip].get("sg_id")
            for p in map(lambda x: x.strip(), ports.split(",")):
                try:
                    proto, port = p.split(" ")
                except:
                    proto = RULE_MAP[p.strip()]
                    port = None
                rule_slug = "{}{}{}".format(proto, port, ip)
                defined_rules.append(rule_slug)
                if rule_slug in config[config_id]["rules"]["egress"]:
                    continue
                rule = aws.add_egress(
                    config_value.get("sg_id"), proto, port, ip, region, creds
                )
                config[config_id]["rules"]["egress"][rule_slug] = rule
        # clean up orphaned rules
        for k, v in config[config_id]["rules"]["egress"].items():
            if k not in defined_rules:
                try:
                    rule = [r for r in rules if r.get("SecurityGroupRuleId") == v][0]
                    print("delete", rule.get("SecurityGroupRuleId"))
                    aws.remove_egress(rule, region, creds)
                except:
                    ...
        # clean up abandoned rules
        for rule in [
            x
            for x in rules
            if x.get("IsEgress") and x.get("GroupId") == config_value.get("sg_id")
        ]:
            if rule.get("SecurityGroupRuleId") not in list(
                config[config_id]["rules"]["egress"].values()
            ):
                aws.remove_egress(rule, region, creds)
    # ec2 instance management
    for config_id, config_value in config.items():
        sg_id = config_value.get("sg_id")
        try:
            defined = list(
                filter(lambda x: x != "", config_value.get("instances").split(","))
            )
        except:
            defined = []
        in_place = list(filter(lambda x: sg_id in x.get("SecurityGroups"), instances))
        ## remove attachments not needed
        for i in in_place:
            id = i.get("InstanceId")
            if id not in defined:
                # remove attachment
                aws.remove_sg_from_instance(sg_id, id, region, creds)
        ## add attachments
        in_place_ids = [x.get("InstanceId") for x in in_place]
        for d in defined:
            if d not in in_place_ids:
                # add attachment
                print("add attach", sg_id, d, region)
                aws.attach_sg_to_instance(sg_id, d, region, creds)

    r.table("sgp").get(sgp_id).update({"config": config}).run(conn)
    conn.close()
    return {"id": sgp_id}


@app.put("/api/sgp/{sgp_id}", dependencies=[Depends(JWTBearer())])
async def update_sgp(sgp_id, sgp: SGP):
    sgp = json.loads(sgp.json())
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    doc = r.table("sgp").get(sgp_id).run(conn)
    result = (
        r.table("sgp")
        .get(sgp_id)
        .replace({**doc, "config": sgp.get("config"), "html": sgp.get("html")})
        .run(conn)
    )
    print(result)
    conn.close()
    return sgp


@app.delete("/api/sgp/{sgp}", dependencies=[Depends(JWTBearer())])
async def delete_sgp(sgp):
    conn = r.connect(host=rethink_host, port=28015, db="sgc")
    doc = r.table("sgp").get(sgp).run(conn)
    region = doc.get("region")
    config = doc.get("config")
    creds = aws.assume_role(doc.get("account"), region)
    # collect security groups that currently exist
    existing = aws.get_aws_sg(doc.get("name"), region, creds)
    # get rules of existing security gruops
    rules = aws.get_aws_sg_rules(list(existing.values()), region, creds)
    # delete any rules referencing security group
    for rule in rules:
        if rule.get("IsEgress"):
            aws.remove_egress(rule, region, creds)
        else:
            aws.remove_ingress(rule, region, creds)
    ## get current attached instances
    instances = aws.get_ec2_instances(list(existing.values()), region, creds)
    for id, sg_id in existing.items():
        # delete any attachments to instances
        for i in instances:
            if sg_id in i.get("SecurityGroups"):
                aws.remove_sg_from_instance(sg_id, i.get("InstanceId"), region, creds)
    # delete security groups
    security_groups = [v.get("sg_id") for k, v in doc.get("config", {}).items()]
    try:
        for s in security_groups:
            aws.delete_sg(s, region, creds)
    except:
        ...
    r.table("sgp").get(sgp).delete().run(conn)
    conn.close()
    return {"sgp": sgp}
