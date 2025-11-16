// specials.js — Enhanced with Inline Video Modal
document.addEventListener("DOMContentLoaded", async () => {
  const specialsGrid = document.getElementById("specialsGrid");
  const emptyState = document.getElementById("specialsEmpty");

  // Modals
  const imageModal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalName = document.getElementById("modalName");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");
  const modalIngredients = document.getElementById("modalIngredients");
  const modalBadges = document.getElementById("modalBadges");
  const modalAR = document.getElementById("modalAR");
  const closeImageModal = document.getElementById("closeImageModal");

  const modelModal = document.getElementById("modelModal");
  const mv = document.getElementById("mv");
  const closeModelModal = document.getElementById("closeModelModal");

  // 🎬 Video Modal
  const videoModal = document.getElementById("videoModal");
  const videoPlayer = document.getElementById("videoPlayer");
  const closeVideoModal = document.getElementById("closeVideoModal");

  let currentItem = null;

  // 🟢 Create Dietary Badges
  const createBadges = (item) => {
    const flags = item.dietaryFlags || [];
    let badges = "";
    if (flags.includes("VEG") || item.dietaryColor === "green")
      badges += '<span class="badge veg">Veg</span>';
    if (flags.includes("NON_VEG") || item.dietaryColor === "red")
      badges += '<span class="badge nonveg">Non-Veg</span>';
    if (flags.includes("GLUTEN_FREE"))
      badges += '<span class="badge gluten-free">GF</span>';
    return badges;
  };

  // 🟢 Create Menu Card
  const createCard = (item) => {
    const t = item.translations?.en || {};
    return `
      <div class="menu-card" data-id="${item.id}">
        <div class="card-media">
          <img src="${item.image}" alt="${t.name}" class="card-img" loading="lazy">
          <div class="card-badges">${createBadges(item)}</div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <h3 class="card-title">${t.name}</h3>
            <div class="card-price">${t.price}</div>
          </div>
          <p class="card-desc">${t.desc}</p>
          ${
            t.ingredients
              ? `<div class="card-ingredients"><small>${t.ingredients}</small></div>`
              : ""
          }
          <div class="card-footer">
            <div class="card-actions">
              <button class="btn btn-secondary view-btn"><i class="fas fa-eye"></i> View</button>
              ${
                item.model
                  ? `<button class="btn btn-primary ar-btn"><i class="fas fa-cube"></i> 3D</button>`
                  : ""
              }
              ${
                item.video
                  ? `<button class="btn btn-secondary video-btn"><i class="fas fa-play"></i> Video</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>`;
  };

  // 🟢 Open Image Modal
  const openModal = (item) => {
    const t = item.translations?.en || {};
    modalImg.src = item.image;
    modalName.textContent = t.name;
    modalDesc.textContent = t.desc;
    modalPrice.textContent = t.price;
    modalIngredients.textContent = t.ingredients;
    modalBadges.innerHTML = createBadges(item);
    modalAR.style.display = item.model ? "inline-flex" : "none";
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    currentItem = item;
  };

  const closeModal = (modal) => {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  // 🧊 Open 3D Modal
  const openAR = (item) => {
    if (!item.model) return;
    mv.setAttribute("src", item.model);
    modelModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  // 🎬 Open Video Modal
  const openVideoModal = (item) => {
    if (!item.video) return;
    const source = videoPlayer.querySelector("source");
    source.src = item.video;
    videoPlayer.load();
    videoPlayer.play().catch(() => console.log("User interaction required"));
    videoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    history.pushState({ videoOpen: true }, "");
  };

  const closeVideo = () => {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  // ❌ Close Modals
  closeImageModal.addEventListener("click", () => closeModal(imageModal));
  closeModelModal.addEventListener("click", () => closeModal(modelModal));
  closeVideoModal.addEventListener("click", closeVideo);

  // 🔙 Handle back button
  window.addEventListener("popstate", (e) => {
    if (videoModal.getAttribute("aria-hidden") === "false") {
      e.preventDefault();
      closeVideo();
    }
  });

  // 🟢 Load Specials
  try {
    const res = await fetch("menu_data.json");
    const data = await res.json();
    let specials = data["daily-specials"]?.items || [];
    if (!specials.length) {
      emptyState.style.display = "block";
      return;
    }

    specialsGrid.innerHTML = specials.map(createCard).join("");

    specialsGrid.querySelectorAll(".menu-card").forEach((card) => {
      const id = card.dataset.id;
      const item = specials.find((i) => i.id === id);

      const viewBtn = card.querySelector(".view-btn");
      if (viewBtn) viewBtn.addEventListener("click", () => openModal(item));

      const arBtn = card.querySelector(".ar-btn");
      if (arBtn) arBtn.addEventListener("click", () => openAR(item));

      const videoBtn = card.querySelector(".video-btn");
      if (videoBtn) videoBtn.addEventListener("click", () => openVideoModal(item));
    });
  } catch (err) {
    console.error("Failed to load specials:", err);
    emptyState.style.display = "block";
  }
});

// 🎨 Fix and keep AR button functional but remove the default pink styling
window.addEventListener("DOMContentLoaded", () => {
  const mv = document.getElementById("mv");
  if (!mv) return;

  // Function to restyle AR button safely
  const restyleARButton = () => {
    const arButton = mv.shadowRoot?.querySelector('.ar-button');
    if (!arButton) return;

    // Apply clean white theme
    arButton.style.background = "#fff";
    arButton.style.color = "#5B1A18";
    arButton.style.border = "2px solid #5B1A18";
    arButton.style.borderRadius = "8px";
    arButton.style.padding = "10px 18px";
    arButton.style.fontWeight = "600";
    arButton.style.fontSize = "0.95rem";
    arButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    arButton.style.transition = "all 0.25s ease";
    arButton.style.cursor = "pointer";

    // Center & elevate it cleanly
    arButton.style.position = "absolute";
    arButton.style.bottom = "16px";
    arButton.style.left = "50%";
    arButton.style.transform = "translateX(-50%)";

    // Hover behavior
    arButton.onmouseenter = () => {
      arButton.style.background = "#5B1A18";
      arButton.style.color = "#fff";
      arButton.style.boxShadow = "0 6px 18px rgba(91,26,24,0.25)";
    };
    arButton.onmouseleave = () => {
      arButton.style.background = "#fff";
      arButton.style.color = "#5B1A18";
      arButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    };
  };

  // Initial restyle after render
  setTimeout(restyleARButton, 1200);

  // Also restyle every time the model changes (for dynamic updates)
  mv.addEventListener("load", () => setTimeout(restyleARButton, 500));
  mv.addEventListener("ar-status", () => setTimeout(restyleARButton, 500));
});

