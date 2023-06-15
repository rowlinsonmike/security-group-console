function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

function getElementCenterCoordinates(element, canvas) {
  let centerX =
    element.getBoundingClientRect().left +
    parseInt(window.getComputedStyle(element).width) / 2 +
    canvas.scrollLeft -
    canvas.getBoundingClientRect().left;
  let centerY =
    element.getBoundingClientRect().top -
    parseInt(window.getComputedStyle(element).height) / 2 +
    canvas.scrollTop -
    canvas.getBoundingClientRect().top +
    15;
  return [centerX, centerY];
}

function drawLine(canvas, id, x1, y1, x2, y2) {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("line__ctn");
  svg.dataset.id = id;
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.innerHTML = "NO RULES";
  text.setAttribute("x", x1 + (x2 - x1) * 0.3);
  text.setAttribute("y", y1 + (y2 - y1) * 0.3);
  text.setAttribute("fill", "white");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("text-anchor", "middle");
  text.classList.add("line__text");
  text.dataset.id = id;
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "rgba(255,255,255,0.3)");
  line.setAttribute("fill", "#000");
  line.setAttribute("stroke-width", "3px");
  line.classList.add("line");
  line.dataset.id = id;
  svg.appendChild(line);
  svg.appendChild(text);
  canvas.appendChild(svg);
}

function updateLine(id, x1, y1, x2, y2) {
  let line = document.querySelectorAll(`.line[data-id="${id}"]`)[0];
  let text = document.querySelectorAll(`.line__text[data-id="${id}"]`)[0];
  text.setAttribute("x", x1 + (x2 - x1) * 0.3);
  text.setAttribute("y", y1 + (y2 - y1) * 0.3);
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
}
function drawBoxName(el, placeholder) {
  //draw box name
  let name = document.createElement("DIV");
  name.classList.add("box__name");
  name.innerText = placeholder;
  el.appendChild(name);
}
function diagram(canvas) {
  let blocks = [];
  let selected = null;
  return {
    getConfig: () => {
      let data = blocks.map((id) => {
        let block = document.getElementById(id);
        return {
          id,
          type: block?.dataset?.type,
          name: block?.querySelector(".box__name")?.innerText,
          instances: block?.dataset?.instances || null,
        };
      });
      //process firewalls
      let firewalls = data
        .filter((d) => d.type === "firewall")
        .reduce((a, c) => {
          return { ...a, [c.id]: { ...c, egress: [], ingress: [] } };
        }, {});
      document.querySelectorAll(".line__ctn").forEach((el) => {
        let line_id = el.dataset.id;
        let ports = document.querySelector(`.line__text[data-id="${line_id}"]`).innerHTML;
        let [source, dest] = line_id.split("|");
        if (firewalls[source]) {
          let destEl = document.getElementById(dest);
          let destValue =
            destEl.dataset.type === "firewall"
              ? dest
              : destEl?.querySelector(".box__name")?.innerText;
          firewalls[source].egress.push([ports, destValue, destEl.dataset.type]);
        }
        if (firewalls[dest]) {
          let sourceEl = document.getElementById(source);
          let sourceValue =
            sourceEl.dataset.type === "firewall"
              ? source
              : sourceEl?.querySelector(".box__name")?.innerText;
          firewalls[dest].ingress.push([ports, sourceValue, sourceEl.dataset.type]);
        }
      });
      return { config: firewalls, html: canvas.innerHTML };
    },
    importData: (data) => {
      canvas.innerHTML = data;
      blocks = [...document.querySelectorAll(".block")].map((el) => el?.dataset?.id);
    },
    init: ({ activeBlock, setActiveBlock }) => {
      canvas.addEventListener("mousedown", function (event) {
        let block = event.target.closest(".block");
        let line = event.target.closest(".line__text");
        if (line) {
          //handle selecting ports
          setActiveBlock({
            id: line.dataset.id,
            type: "port",
          });
        }
        if (block && block.dataset.id !== activeBlock) {
          setActiveBlock({
            id: block.dataset.id,
            type: block.dataset.type,
          });
        }
      });
    },
    addIOBlock: () => {
      let id = uuidv4();
      blocks.push(id);
      let block = document.createElement("DIV");
      drawBoxName(block, "New Firewall");
      block.setAttribute("id", id);
      block.dataset.id = id;
      let inBox = document.createElement("DIV");
      inBox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
    </svg>
    `;
      inBox.classList.add("block__in");
      inBox.dataset.id = id;
      let outBox = document.createElement("DIV");
      outBox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
    `;
      outBox.classList.add("block__out");
      outBox.dataset.id = id;
      block.dataset.type = "firewall";
      block.appendChild(inBox);
      block.appendChild(outBox);
      block.classList.add("block");
      canvas.appendChild(block);
    },
    addIBlock: () => {
      let id = uuidv4();
      blocks.push(id);
      let block = document.createElement("DIV");
      block.setAttribute("id", id);
      block.dataset.id = id;
      drawBoxName(block, "New Source");
      let outBox = document.createElement("DIV");
      outBox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>`;
      outBox.classList.add("block__out");
      outBox.dataset.id = id;
      block.dataset.type = "source";
      block.appendChild(outBox);
      block.classList.add("block");
      canvas.appendChild(block);
    },
    addOBlock: () => {
      let id = uuidv4();
      blocks.push(id);
      let block = document.createElement("DIV");
      block.setAttribute("id", id);
      block.dataset.id = id;
      block.dataset.type = "destination";
      drawBoxName(block, "New Destination");
      let inBox = document.createElement("DIV");
      inBox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
    </svg>`;
      inBox.classList.add("block__in");
      inBox.dataset.id = id;
      block.appendChild(inBox);
      block.classList.add("block");
      canvas.appendChild(block);
    },
    beginDrag: (event) => {
      let block = event.target.closest(".block");
      let block_in = event.target.closest(".block__in");
      let block_out = event.target.closest(".block__out");
      if (block_in) {
        if (!selected) return;
        let source = document.querySelectorAll(`.block__out[data-id="${selected}"]`)[0];
        let source_id = source.dataset.id;
        let dest_id = block_in.dataset.id;
        let line_id = `${source_id}|${dest_id}`;
        //don't allow duplicate lines
        if (
          [...document.querySelectorAll(".line__ctn")].map((l) => l.dataset.id).includes(line_id)
        ) {
          console.log("can't make duplicate connection");
          return;
        }
        //don't all connection to itself
        if (source_id === dest_id) {
          console.log("can't connect to same block");
          return;
        }
        let [x1, y1] = getElementCenterCoordinates(source, canvas);
        let [x2, y2] = getElementCenterCoordinates(block_in, canvas);
        drawLine(canvas, line_id, x1, y1, x2, y2);
        selected = null;
      } else if (block_out) {
        selected = block_out.dataset.id;
      } else if (block) {
        selected = null;
        //moving block
        document.addEventListener("mousemove", onMouseMove);
        // calculate and update initial position
        let shiftX = event.clientX - block.getBoundingClientRect().left;
        let shiftY = event.clientY - block.getBoundingClientRect().top;
        function onMouseMove(event) {
          // calculate new position
          let newLeft = event.clientX - shiftX - canvas.getBoundingClientRect().left;
          let newTop = event.clientY - shiftY - canvas.getBoundingClientRect().top;

          // update position
          block.style.left = newLeft + "px";
          block.style.top = newTop + "px";
          const relatedConnections = [...document.querySelectorAll(".line__ctn")]
            .map((l) => l.dataset.id)
            .filter((c) => c.includes(block.getAttribute("id")));
          for (let index = 0; index < relatedConnections.length; index++) {
            let line_id = relatedConnections[index];
            const [source, dest] = line_id.split("|");
            let source_el = document.querySelectorAll(`.block__out[data-id="${source}"]`)[0];
            let dest_el = document.querySelectorAll(`.block__in[data-id="${dest}"]`)[0];
            let [x1, y1] = getElementCenterCoordinates(source_el, canvas);
            let [x2, y2] = getElementCenterCoordinates(dest_el, canvas);
            updateLine(line_id, x1, y1, x2, y2);
          }
        }

        document.addEventListener("mouseup", function onMouseUp() {
          selected = null;
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        });
      } else {
        selected = null;
        return;
      }
    },
  };
}
export default diagram;
