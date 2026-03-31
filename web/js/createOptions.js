import { fetchNui } from "./fetchNui.js";

const targetLabel = document.getElementById("target-label");
let isSelecting = false;

function onClick() {
  if (isSelecting) return;
  isSelecting = true;

  // when nuifocus is disabled after a click, the hover event is never released
  this.style.pointerEvents = "none";

  const optionsWrapper = document.getElementById("options-wrapper");
  const eye = document.getElementById("eyeSvg");
  const body = document.body;

  if (optionsWrapper) {
    optionsWrapper.classList.remove("visible");
    optionsWrapper.classList.remove("radial");
    body.classList.remove("radial-active");
  }

  if (eye) {
    eye.classList.remove("eye-hover");
  }

  body.style.visibility = "hidden";

  fetchNui("select", [this.targetType, this.targetId, this.zoneId]);

  setTimeout(() => {
    this.style.pointerEvents = "auto";
    isSelecting = false;
  }, 500);
}

function onEnter() {
  if (targetLabel) targetLabel.innerText = this.getAttribute("data-label");
}

function onLeave() {
  if (targetLabel) targetLabel.innerText = "";
}

export function createOptions(type, data, id, zoneId) {
  if (data.hide) return null;

  const option = document.createElement("div");
  const iconElement = `<i class="fa-fw ${data.icon} option-icon" ${
    data.iconColor ? `style = color:${data.iconColor} !important` : null
  }"></i>`;

  option.innerHTML = `${iconElement}<p class="option-label"><span>${data.label}</span></p>`;
  option.className = "option-container";
  option.targetType = type;
  option.targetId = id;
  option.zoneId = zoneId;
  option.setAttribute("data-label", data.label);

  option.addEventListener("click", onClick);
  option.addEventListener("mouseenter", onEnter);
  option.addEventListener("mouseleave", onLeave);

  return option;
}
