import boto3
from botocore.exceptions import ClientError
import os
import util
import traceback

def assume_role(account, region):
    if os.getenv("ACCOUNT") == account:
        return {}
    sts = boto3.client("sts", region_name=region)
    role = "arn:aws:iam::" + account + ":role/" + os.getenv("ASSUME_ROLE")
    memberAcct = sts.assume_role(RoleArn=role, RoleSessionName="SGC")
    aws_access_key_id = memberAcct["Credentials"]["AccessKeyId"]
    aws_secret_access_key = memberAcct["Credentials"]["SecretAccessKey"]
    aws_session_token = memberAcct["Credentials"]["SessionToken"]
    return {
        "aws_access_key_id": aws_access_key_id,
        "aws_secret_access_key": aws_secret_access_key,
        "aws_session_token": aws_session_token,
    }

def format_ip_permission(cidr):
    options = {}
    if util.confirm_cidr(cidr):
        #use cidr range notation
        options["IpRanges"] = [{"CidrIp": cidr}]
    else:
        #use nested security group notation
        options["UserIdGroupPairs"] = [{"GroupId": cidr}]
    return options

def create_security_group(sgp,id,name, vpc, region, creds):
    # Create an EC2 client
    ec2 = boto3.client("ec2", region_name=region, **creds)

    # Create the security group
    try:
        response = ec2.create_security_group(
            GroupName=name, Description=name, VpcId=vpc,TagSpecifications=[{'ResourceType':'security-group','Tags': [
                {
                    'Key': 'UsedBy',
                    'Value': sgp
                },
                {
                    'Key': 'ConfigId',
                    'Value': id
                },
            ]}]
        )
        security_group_id = response["GroupId"]
        return security_group_id
    except ClientError as e:
        ...

def add_ingress(sg_id,proto,port,ip,region,creds):
    # Create an EC2 client
    ec2 = boto3.client("ec2", region_name=region, **creds)
    rule_id = ec2.authorize_security_group_ingress(
                        GroupId=sg_id,
                        IpPermissions=[
                            {
                                "IpProtocol": proto,
                                "FromPort": int(port) if proto not in ['icmp','-1'] else int(-1),
                                "ToPort": int(port) if proto not in ['icmp','-1'] else int(-1),
                                **format_ip_permission(ip)
                            }
                        ],
    )['SecurityGroupRules'][0].get("SecurityGroupRuleId")
    return rule_id

def add_egress(sg_id,proto,port,ip,region,creds):
    # Create an EC2 client
    ec2 = boto3.client("ec2", region_name=region, **creds)
    rule_id = ec2.authorize_security_group_egress(
                        GroupId=sg_id,
                        IpPermissions=[
                            {
                                "IpProtocol": proto,
                                "FromPort": int(port) if proto not in ['icmp','-1'] else int(-1),
                                "ToPort": int(port) if proto not in ['icmp','-1'] else int(-1),
                                **format_ip_permission(ip)
                            }
                        ],
    )['SecurityGroupRules'][0].get("SecurityGroupRuleId")
    return rule_id

def remove_ingress(rule,region,creds):
    ec2 = boto3.client("ec2", region_name=region, **creds)
    try:
        ec2.revoke_security_group_ingress(GroupId=rule.get("GroupId"),SecurityGroupRuleIds=[rule.get("SecurityGroupRuleId")])
    except:
        ...

def remove_egress(rule,region,creds):
    ec2 = boto3.client("ec2", region_name=region, **creds)
    try:
        ec2.revoke_security_group_egress(GroupId=rule.get("GroupId"),SecurityGroupRuleIds=[rule.get("SecurityGroupRuleId")])
    except:
        ...

def get_ec2_instances(rules, region, creds):
    ec2 = boto3.client("ec2", region_name=region, **creds)
    print(rules)
    try:
        instances = ec2.describe_instances(Filters=[{"Name":"network-interface.group-id","Values":rules}])["Reservations"][0]["Instances"]
        for idx,x in enumerate(instances):
            instances[idx]["SecurityGroups"] = [s.get("GroupId") for s in x.get("SecurityGroups")]
            
    except:
        traceback.print_exc()
        instances = []
    return instances

def attach_sg_to_instance(sg_id,instance,region,creds):
    ec2 = boto3.client('ec2',region_name=region,**creds)
    try:
        current = ec2.describe_instances(InstanceIds=[instance])["Reservations"][0]["Instances"][0]
        groups = [x.get("GroupId") for x in current.get("SecurityGroups")]
        response = ec2.modify_instance_attribute(
                InstanceId=instance,
                Groups=[sg_id,*groups]
        )
    except:
        traceback.print_exc()

def remove_sg_from_instance(sg_id,instance,region,creds):
    ec2 = boto3.client('ec2',region_name=region,**creds)
    try:
        current = ec2.describe_instances(InstanceIds=[instance])["Reservations"][0]["Instances"][0]
        groups = [x.get("GroupId") for x in current.get("SecurityGroups") if x.get("GroupId") != sg_id]
        response = ec2.modify_instance_attribute(
                InstanceId=instance,
                Groups=groups
        )
    except:
        traceback.print_exc()

def delete_sg(sg_id,region,creds):
    ec2 = boto3.client('ec2',region_name=region,**creds)
    try:
        ec2.delete_security_group(GroupId=sg_id)
    except:
        traceback.print_exc()
        ...

def get_aws_sg(name,region,creds):
    ec2 = boto3.client('ec2',region_name=region,**creds)
    response = ec2.describe_security_groups(
    Filters=[
        {
            'Name': 'tag:UsedBy',
            'Values': [
                name,
            ]
        },
    ])["SecurityGroups"]
    result = {}
    for x in response:
        config_id = [t.get("Value") for t in x.get("Tags") if t.get("Key") == 'ConfigId'][0]
        sg_id = x.get("GroupId")
        result[config_id] = sg_id
    return result

def get_aws_sg_rules(groups,region,creds):
    try:
        ec2 = boto3.client('ec2',region_name=region,**creds)
        response = ec2.describe_security_group_rules(
        Filters=[
            {
                'Name': 'group-id',
                'Values': groups
            },
        ])["SecurityGroupRules"]
    except:
        return []
    return response