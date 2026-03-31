import { createOptions } from "./createOptions.js";

const optionsWrapper = document.getElementById("options-wrapper");
const body = document.body;
const eye = document.getElementById("eyeSvg");
const targetLabel = document.getElementById("target-label");

let currentOptions = [];
let isRadialMode = false;
let selectedOptionIndex = -1;

window.addEventListener("click", () => {
  if (
    isRadialMode &&
    selectedOptionIndex !== -1 &&
    currentOptions[selectedOptionIndex]
  ) {
    currentOptions[selectedOptionIndex].click();
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isRadialMode && optionsWrapper.classList.contains("visible")) {
    isRadialMode = true;
    renderOptions();
  }

  if (
    isRadialMode &&
    optionsWrapper.classList.contains("visible") &&
    currentOptions.length > 0
  ) {
    const rect = optionsWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    let angle = Math.atan2(dy, dx);

    optionsWrapper.style.setProperty(
      "--mouse-angle",
      angle + Math.PI / 2 + "rad",
    );

    let adjustedAngle = angle + Math.PI / 2;
    if (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;

    const count = currentOptions.length;
    const rawIndex = Math.round((adjustedAngle / (2 * Math.PI)) * count);
    const newIndex = ((rawIndex % count) + count) % count;

    if (newIndex !== selectedOptionIndex || targetLabel.innerText === "") {
      if (selectedOptionIndex !== -1 && currentOptions[selectedOptionIndex]) {
        currentOptions[selectedOptionIndex].classList.remove("selected");
      }

      selectedOptionIndex = newIndex;

      if (currentOptions[selectedOptionIndex]) {
        currentOptions[selectedOptionIndex].classList.add("selected");

        if (targetLabel) {
          const label =
            currentOptions[selectedOptionIndex].getAttribute("data-label");
          targetLabel.innerText = label || "";
        }
      }
    }
  }
});

function renderOptions() {
  optionsWrapper.innerHTML = "";
  if (targetLabel) targetLabel.innerText = "";
  selectedOptionIndex = -1;

  if (currentOptions.length === 0) {
    optionsWrapper.classList.remove("visible");
    optionsWrapper.classList.remove("radial");
    body.classList.remove("radial-active");
    return;
  }

  optionsWrapper.classList.add("visible");

  if (isRadialMode) {
    optionsWrapper.classList.add("radial");
    body.classList.add("radial-active");

    const count = currentOptions.length;
    const radius = 90;
    const offsetAngle = -Math.PI / 2;

    currentOptions.forEach((el, index) => {
      const angle = (index / count) * 2 * Math.PI + offsetAngle;
      const x = 125 + radius * Math.cos(angle);
      const y = 125 + radius * Math.sin(angle);

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      optionsWrapper.appendChild(el);
    });
  } else {
    optionsWrapper.classList.remove("radial");
    body.classList.remove("radial-active");

    const spacing = 40;
    currentOptions.forEach((el, i) => {
      el.style.left = "";
      el.style.top = "";

      let offsetY = 0;
      if (i > 0) {
        if (i % 2 !== 0) {
          offsetY = -Math.ceil(i / 2) * spacing;
        } else {
          offsetY = (i / 2) * spacing;
        }
      }

      el.style.top = `${offsetY}px`;

      optionsWrapper.appendChild(el);

      const labelContainer = el.querySelector(".option-label");
      if (labelContainer) {
        labelContainer.style.fontSize = "11pt";

        if (labelContainer.scrollWidth > labelContainer.clientWidth) {
          let fontSize = 11;
          while (
            labelContainer.scrollWidth > labelContainer.clientWidth &&
            fontSize > 8
          ) {
            fontSize -= 0.5;
            labelContainer.style.fontSize = `${fontSize}pt`;
          }
        }
      }
    });
  }
}

window.addEventListener("message", (event) => {
  switch (event.data.event) {
    case "visible": {
      body.style.visibility = event.data.state ? "visible" : "hidden";
      eye.classList.remove("eye-hover");
      optionsWrapper.classList.remove("visible");
      optionsWrapper.classList.remove("radial");
      body.classList.remove("radial-active");
      optionsWrapper.innerHTML = "";
      if (targetLabel) targetLabel.innerText = "";
      currentOptions = [];
      isRadialMode = false;
      selectedOptionIndex = -1;
      return;
    }

    case "leftTarget": {
      eye.classList.remove("eye-hover");
      optionsWrapper.classList.remove("visible");
      optionsWrapper.classList.remove("radial");
      body.classList.remove("radial-active");
      optionsWrapper.innerHTML = "";
      if (targetLabel) targetLabel.innerText = "";
      currentOptions = [];
      isRadialMode = false;
      selectedOptionIndex = -1;
      return;
    }

    case "setTarget": {
      eye.classList.add("eye-hover");
      currentOptions = [];
      isRadialMode = false;
      selectedOptionIndex = -1;

      if (event.data.options) {
        for (const type in event.data.options) {
          event.data.options[type].forEach((data, id) => {
            const el = createOptions(type, data, id + 1);
            if (el) currentOptions.push(el);
          });
        }
      }

      if (event.data.zones) {
        for (let i = 0; i < event.data.zones.length; i++) {
          event.data.zones[i].forEach((data, id) => {
            const el = createOptions("zones", data, id + 1, i + 1);
            if (el) currentOptions.push(el);
          });
        }
      }

      renderOptions();
    }
  }
});
