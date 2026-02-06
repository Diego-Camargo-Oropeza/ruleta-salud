const wheelCanvas = document.getElementById("wheel");
const wheelWrap = document.getElementById("wheel-wrap");
const spinBtn = document.getElementById("spin-btn");
const resultName = document.getElementById("result-name");
const resultReps = document.getElementById("result-reps");
const modal = document.getElementById("video-modal");
const modalFrame = document.getElementById("modal-video");
const modalClose = document.getElementById("modal-close");
const modalName = document.getElementById("modal-name");
const modalReps = document.getElementById("modal-reps");

const svgIcon = (label, color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="${color}" opacity="0.2" />
      <circle cx="60" cy="32" r="12" fill="${color}" />
      <path d="M60 46 L60 78" stroke="${color}" stroke-width="8" stroke-linecap="round" />
      <path d="M60 56 L34 68" stroke="${color}" stroke-width="7" stroke-linecap="round" />
      <path d="M60 56 L86 64" stroke="${color}" stroke-width="7" stroke-linecap="round" />
      <path d="M60 78 L38 100" stroke="${color}" stroke-width="7" stroke-linecap="round" />
      <path d="M60 78 L84 100" stroke="${color}" stroke-width="7" stroke-linecap="round" />
      <text x="60" y="114" text-anchor="middle" font-size="14" fill="#ffffff" font-family="Poppins, sans-serif">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
};

const exercises = [
  {
    id: "lunge",
    name: "Desplante",
    weight: 2,
    repsMin: 10,
    repsMax: 16,
    youtubeId: "AnYl6Nk9GOA",
    color: "#ff7a59",
    image: "./src/img/desplante.png"
  },
  {
    id: "squat",
    name: "Sentadillas",
    weight: 3,
    repsMin: 12,
    repsMax: 20,
    youtubeId: "aclHkVaku9U",
    color: "#ffd166",
    image: "./src/img/sentadilla.png"
  },
  {
    id: "jumping",
    name: "Jumping Jacks",
    weight: 2,
    repsMin: 20,
    repsMax: 30,
    youtubeId: "c4DAnQ6DtF8",
    color: "#42d6a4",
    image: "./src/img/jumping-jacks.png"
  },
  {
    id: "plank",
    name: "Plancha",
    weight: 1,
    repsMin: 20,
    repsMax: 40,
    youtubeId: "pSHjTRCQxIw",
    color: "#7bdff2",
    image: "./src/img/plancha.png"
  },
  {
    id: "burpee",
    name: "Burpees",
    weight: 2,
    repsMin: 8,
    repsMax: 14,
    youtubeId: "dZgVxmf6jkA",
    color: "#fca311",
    image: "./src/img/burpees.png"
  },
  {
    id: "crunch",
    name: "Abdominales",
    weight: 3,
    repsMin: 15,
    repsMax: 25,
    youtubeId: "Xyd_fa5zoEU",
    color: "#b388ff",
    image: "./src/img/abs.png"
  }
];

const state = {
  rotation: 0,
  spinning: false,
  imagesReady: 0,
  images: []
};

const totalWeight = () => exercises.reduce((sum, e) => sum + e.weight, 0);

const buildImageCache = () => {
  state.images = exercises.map((exercise) => {
    const img = new Image();
    img.src = exercise.image;
    img.onload = () => {
      state.imagesReady += 1;
      if (state.imagesReady === exercises.length) {
        drawWheel();
      }
    };
    return img;
  });
};

const sizeCanvas = () => {
  const maxSize = Math.min(1400, Math.max(620, wheelWrap.clientWidth - 8));
  const ratio = window.devicePixelRatio || 1;
  wheelCanvas.width = maxSize * ratio;
  wheelCanvas.height = maxSize * ratio;
  wheelCanvas.style.width = `${maxSize}px`;
  wheelCanvas.style.height = `${maxSize}px`;
  const ctx = wheelCanvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const drawWheel = () => {
  sizeCanvas();
  const ctx = wheelCanvas.getContext("2d");
  const radius = wheelCanvas.clientWidth / 2;
  ctx.clearRect(0, 0, wheelCanvas.clientWidth, wheelCanvas.clientHeight);
  ctx.save();
  ctx.translate(radius, radius);

  const weights = totalWeight();
  let currentAngle = -Math.PI / 2;

  exercises.forEach((exercise, index) => {
    const sliceAngle = (exercise.weight / weights) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = `${exercise.color}22`;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const labelAngle = currentAngle + sliceAngle / 2;
    ctx.save();
    ctx.rotate(labelAngle);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f7f5ff";
    const fontSize = Math.max(16, Math.round(radius * 0.06));
    ctx.font = `700 ${fontSize}px Poppins`;
    ctx.fillText(exercise.name, radius - 16, 6);
    ctx.restore();

    const img = state.images[index];
    if (img && img.complete) {
      const boxSize = radius * 0.32;
      const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
      let drawW = boxSize;
      let drawH = boxSize;
      if (ratio > 1) {
        drawW = boxSize;
        drawH = boxSize / ratio;
      } else {
        drawH = boxSize;
        drawW = boxSize * ratio;
      }
      ctx.save();
      ctx.rotate(labelAngle);
      ctx.drawImage(img, radius * 0.28 - drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    currentAngle += sliceAngle;
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd166";
  ctx.fill();
  ctx.restore();
};

const pickExercise = () => {
  const total = totalWeight();
  let rnd = Math.random() * total;
  for (const exercise of exercises) {
    rnd -= exercise.weight;
    if (rnd <= 0) return exercise;
  }
  return exercises[exercises.length - 1];
};

const randomReps = (exercise) => {
  const min = Math.min(exercise.repsMin, exercise.repsMax);
  const max = Math.max(exercise.repsMin, exercise.repsMax);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const findSegmentCenterDeg = (target) => {
  const weights = totalWeight();
  let currentAngle = -90;
  for (const exercise of exercises) {
    const sliceAngle = (exercise.weight / weights) * 360;
    if (exercise.id === target.id) {
      return currentAngle + sliceAngle / 2;
    }
    currentAngle += sliceAngle;
  }
  return 0;
};

const animateRotation = (toRotation, duration = 4200, onDone) => {
  const start = performance.now();
  const from = state.rotation;
  const change = toRotation - from;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const frame = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutCubic(progress);
    state.rotation = from + change * eased;
    wheelWrap.style.transform = `rotate(${state.rotation}deg)`;
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      state.spinning = false;
      spinBtn.disabled = false;
      spinBtn.textContent = "Girar de nuevo";
      if (onDone) onDone();
    }
  };

  requestAnimationFrame(frame);
};

const updateResult = (exercise) => {
  const reps = randomReps(exercise);
  if (resultName) resultName.textContent = exercise.name;
  if (resultReps) resultReps.textContent = `${reps} reps`;
  if (modalFrame) {
    modalFrame.src = `https://www.youtube.com/embed/${exercise.youtubeId}?rel=0`;
  }
  if (modalName) modalName.textContent = exercise.name;
  if (modalReps) modalReps.textContent = `${reps} reps`;
};

spinBtn.addEventListener("click", () => {
  if (state.spinning) return;
  state.spinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = "Girando...";

  const exercise = pickExercise();
  updateResult(exercise);

  const centerAngle = findSegmentCenterDeg(exercise);
  const spins = 4 + Math.floor(Math.random() * 3);
  const targetRotation = state.rotation + spins * 360 + (-90 - centerAngle);

  animateRotation(targetRotation, 4200, openModal);
});

window.addEventListener("resize", drawWheel);

const openModal = () => {
  if (!modal || !modalFrame) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  const src = modalFrame.src;
  if (src && !src.includes("autoplay=1")) {
    modalFrame.src = `${src}${src.includes("?") ? "&" : "?"}autoplay=1&mute=1`;
  }
};

const closeModal = () => {
  if (!modal || !modalFrame) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.style.display = "";
  modal.setAttribute("aria-hidden", "true");
  modalFrame.src = modalFrame.src.replace(/(&|\\?)autoplay=1&mute=1/g, "");
};

modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

buildImageCache();
