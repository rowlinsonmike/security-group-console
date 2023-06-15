import React, { useState, useRef } from "react";
import diagram from "./diagram";
import FireIcon from "@heroicons/react/24/solid/FireIcon";
import PaperAirplaneIcon from "@heroicons/react/24/solid/PaperAirplaneIcon";
import MapPinIcon from "@heroicons/react/24/solid/MapPinIcon";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import CheckIcon from "@heroicons/react/24/solid/CheckIcon";
import PowerIcon from "@heroicons/react/24/solid/PowerIcon";
import { SvgIcon } from "@mui/material";
import Input from "../Input";
import { Stack, Button } from "@mui/material";
import toast from "react-hot-toast";
import useFetch from "src/hooks/use-fetch";
let ctx;

const PortConfig = ({ active }) => {
  const [ports, setPorts] = React.useState("");
  React.useEffect(() => {
    setPorts(document.querySelector(`.line__text[data-id="${active?.id}"]`)?.innerHTML || "");
  }, [active]);
  const saveHandler = () => {
    if (ports.trim() === "") return;
    document.querySelector(`.line__text[data-id="${active?.id}"]`).innerHTML = ports;
  };
  const deleteHandler = () => {
    document.querySelector(`.line__ctn[data-id="${active?.id}"]`).remove();
  };
  return (
    <div>
      <h2>Port Config</h2>
      <div className="inputs">
        <input
          onChange={(e) => setPorts(e.target.value)}
          value={ports}
          placeholder="comma seperated list of ports"
        />
      </div>
      <div className="options">
        <button className="button-dg" onClick={saveHandler}>
          <SvgIcon fontSize="small">
            <CheckCircleIcon />
          </SvgIcon>
        </button>
        <button className="button-dg" onClick={deleteHandler}>
          <SvgIcon fontSize="small">
            <TrashIcon />
          </SvgIcon>
        </button>
      </div>
    </div>
  );
};
const BlockConfig = ({ title, namePlaceholder, active }) => {
  const [name, setName] = React.useState(namePlaceholder);
  React.useEffect(() => {
    setName(document.getElementById(active?.id)?.querySelector(".box__name")?.innerText || "");
  }, [active]);
  const saveHandler = () => {
    if (name.trim() === "") return;
    document.getElementById(active?.id).querySelector(".box__name").innerText = name;
  };
  const deleteHandler = () => {
    if (name.trim() === "") return;
    document.getElementById(active?.id).remove();
    document.querySelectorAll(".line__ctn").forEach((el) => {
      if (el.dataset.id.includes(active?.id)) el.remove();
    });
  };
  return (
    <div>
      <h2>{title}</h2>
      <div className="inputs">
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder={namePlaceholder}
        />
      </div>
      <div className="options">
        <button className="button-dg" onClick={saveHandler}>
          <SvgIcon fontSize="small">
            <CheckCircleIcon />
          </SvgIcon>
        </button>
        <button className="button-dg" onClick={deleteHandler}>
          <SvgIcon fontSize="small">
            <TrashIcon />
          </SvgIcon>
        </button>
      </div>
    </div>
  );
};
const FirewallConfig = ({ active }) => {
  const [name, setName] = React.useState("");
  const [instances, setInstances] = React.useState("");
  React.useEffect(() => {
    setName(document.getElementById(active?.id)?.querySelector(".box__name")?.innerText || "");
    setInstances(document.getElementById(active?.id)?.dataset.instances || "");
  }, [active]);
  const saveHandler = () => {
    if (name.trim() === "") return;
    document.getElementById(active?.id).querySelector(".box__name").innerText = name;
    document.getElementById(active?.id).dataset.instances = instances;
  };
  const deleteHandler = () => {
    if (name.trim() === "") return;
    document.getElementById(active?.id).remove();
    document.querySelectorAll(".line__ctn").forEach((el) => {
      if (el.dataset.id.includes(active?.id)) el.remove();
    });
  };

  return (
    <div>
      <h2>Security Group</h2>
      <div className="inputs">
        <input onChange={(e) => setName(e.target.value)} value={name} placeholder={"Name"} />
        <textarea
          rows="10"
          cols="50"
          onChange={(e) => setInstances(e.target.value)}
          value={instances}
          placeholder={"comma seperated instance ids"}
        />
      </div>
      <div className="options">
        <button className="button-dg" onClick={saveHandler}>
          <SvgIcon fontSize="small">
            <CheckCircleIcon />
          </SvgIcon>
        </button>
        <button className="button-dg" onClick={deleteHandler}>
          <SvgIcon fontSize="small">
            <TrashIcon />
          </SvgIcon>
        </button>
      </div>
    </div>
  );
};
export default function Diagram({ refresh, id, data, router }) {
  const [dirty, setDirty] = useState(false);
  const _fetch = useFetch();
  const dialog = useRef(null);
  const [updated, setUpdated] = useState(false);
  const [activeBlock, setActiveBlock] = React.useState(null);
  React.useEffect(() => {
    let canvas = document.getElementById("diagram_canvas");
    ctx = diagram(canvas);
    ctx.init({ activeBlock, setActiveBlock });
    canvas.addEventListener("mousedown", function (event) {
      setDirty(true);
      ctx.beginDrag(event);
    });
  }, []);
  React.useEffect(() => {
    if (data) {
      ctx.importData(data?.html);
    }
  }, [data]);

  async function deleteFirewall() {
    const response = await _fetch(`/api/sgp/${id}`, { method: "delete" });
    const result = await response.json();
    if (result?.sgp) {
      router.push("/sgp");
    }
  }
  const panel = React.useMemo(() => {
    return activeBlock?.type === "source" ? (
      <BlockConfig
        {...{
          title: "Source",
          namePlaceholder: "IP/CIDR",
          active: activeBlock,
        }}
      />
    ) : activeBlock?.type === "destination" ? (
      <BlockConfig
        {...{
          title: "Destination",
          namePlaceholder: "IP/CIDR",
          active: activeBlock,
        }}
      />
    ) : activeBlock?.type === "firewall" ? (
      <FirewallConfig
        {...{
          active: activeBlock,
        }}
      />
    ) : activeBlock?.type === "port" ? (
      <PortConfig active={activeBlock} />
    ) : null;
  }, [activeBlock]);
  return (
    <div id="diagram_app">
      <Stack mb={2} direction="row" spacing={2}>
        <button className="button-dg" onClick={() => ctx.addIBlock()}>
          <SvgIcon fontSize="small">
            <PaperAirplaneIcon />
          </SvgIcon>
        </button>
        <button className="button-dg" onClick={() => ctx.addIOBlock()}>
          <SvgIcon fontSize="small">
            <FireIcon />
          </SvgIcon>
        </button>
        <button className="button-dg" onClick={() => ctx.addOBlock()}>
          <SvgIcon fontSize="small">
            <MapPinIcon />
          </SvgIcon>
        </button>
        <>
          {!updated || dirty ? (
            <Button
              sx={{ maxWidth: 200 }}
              onClick={async () => {
                const toastId = toast.loading("Updating Policy...");
                await new Promise((r) => setTimeout(() => r(), 1500));
                let update = ctx.getConfig();
                Object.keys(update.config).forEach((x) => {
                  update.config[x] = { ...data?.config[x], ...update.config[x] };
                });
                let payload = { ...update };
                let response = await _fetch(`/api/sgp/${id}`, {
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  method: "PUT",
                  body: JSON.stringify(payload),
                });
                toast.dismiss(toastId);
                let responseBody = await response.json();
                setUpdated(true);
                setDirty(false);
              }}
              startIcon={
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              }
              variant="contained"
            >
              Update
            </Button>
          ) : (
            <Button
              sx={{ maxWidth: 200 }}
              onClick={async () => {
                const toastId = toast.loading("Deploying Policy...");
                await new Promise((r) => setTimeout(() => r(), 1500));
                await _fetch(`/api/sgp/${id}/deploy`, { method: "POST" });
                await refresh();
                toast.dismiss(toastId);
                setUpdated(false);
              }}
              startIcon={
                <SvgIcon fontSize="small">
                  <PowerIcon />
                </SvgIcon>
              }
              variant="contained"
            >
              Deploy
            </Button>
          )}
          <Button
            sx={{ maxWidth: 200 }}
            // onClick={deleteFirewall}
            onClick={() => dialog?.current?.showModal()}
            startIcon={
              <SvgIcon fontSize="small">
                <TrashIcon />
              </SvgIcon>
            }
            variant="contained"
          >
            Delete
          </Button>
          <dialog ref={dialog} id="delete-diag">
            <h1>Are you sure?</h1>
            <Stack direction="row" spacing={2}>
              <Button
                sx={{ maxWidth: 150 }}
                onClick={async () => {
                  const toastId = toast.loading("Deleting Policy...");
                  await new Promise((r) => setTimeout(() => r(), 1500));
                  await deleteFirewall();
                  toast.dismiss(toastId);
                  dialog?.current?.close();
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <TrashIcon />
                  </SvgIcon>
                }
                variant="contained"
              >
                Delete
              </Button>
              <Button
                sx={{ maxWidth: 150 }}
                onClick={async () => {
                  dialog?.current?.close();
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <CheckIcon />
                  </SvgIcon>
                }
                variant="contained"
              >
                Cancel
              </Button>
            </Stack>
          </dialog>
        </>
      </Stack>
      <div id="diagram_ctn">
        <div id="diagram_canvas" style={{ backgroundImage: `url('/assets/tile.png')` }}></div>
        <div id="diagram_pane">{panel}</div>
      </div>
    </div>
  );
}
