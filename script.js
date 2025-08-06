// get references to key elements in the DOM
const addButtons = document.querySelectorAll(".add-btn");
const bundleList = document.querySelector(".bundle-list");
const discountAmount = document.querySelector(".discount-amount");
const subtotalAmount = document.querySelector(".subtotal-amount");
const cartButton = document.querySelector(".cart-btn");
const progressBar = document.createElement("div");

// Create a visual progress bar above the bundle list to show how close user is to getting discount
progressBar.style.height = "5px";
progressBar.style.marginBottom = "10px";
progressBar.style.backgroundColor = "#eee";
progressBar.innerHTML = `<div id="progress-fill" style="height:100%;width:0;background:#000;transition:width 0.3s;"></div>`;
bundleList.parentElement.insertBefore(progressBar, bundleList);

// Initialize cart state
let selectedProducts = [];
let cartSubmitted = false;

// Set the initial state of the cart button
initializeCartButton();

// Loop through all add buttons and attach click handlers
addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.closest(".product");
    const title = product.querySelector(".product-title").innerText;
    const priceText = product.querySelector(".product-price").innerText;
    const price = parseFloat(priceText.replace("$", ""));
    const imgSrc = product.querySelector("img").src;

    // Prevent duplicate additions by checking title
    const exists = selectedProducts.find((item) => item.title === title);

    if (!exists) {
      selectedProducts.push({ title, price, imgSrc, quantity: 1 });
      updateBundle(); // Refresh UI with new bundle state
      updateButtonState(button, true); // Disable and change button after adding
    } else {
      alert("This product is already in your bundle!");
    }
  });
});

// Main function to update the bundle display and totals
function updateBundle() {
  bundleList.innerHTML = ""; // Clear existing list

  selectedProducts.forEach((item, index) => {
    // Create a row for each selected product
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginBottom = "15px";

    // Build inner HTML for the product entry
    div.innerHTML = `
      <img src="${
        item.imgSrc
      }" style="width:50px;height:50px;object-fit:cover;margin-right:10px;border-radius:4px;">
      <div style="flex:1">
        <div style="font-size:14px;font-weight:500;">${item.title}</div>
        <div style="font-size:13px;">$${item.price.toFixed(2)}</div>
        <div style="display:flex;align-items:center;margin-top:5px;">
          <button class="qty-btn" data-index="${index}" data-action="decrease">–</button>
          <span style="margin: 0 10px">${item.quantity}</span>
          <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
        </div>
      </div>
      <button class="delete-btn" data-index="${index}" style="margin-left:10px;cursor:pointer;font-size:90%;border:none;background:none;padding:0;">🗑️</button>
    `;
    bundleList.appendChild(div); // Add product to bundle list
  });

  // Handle quantity increase/decrease events
  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const action = e.target.dataset.action;
      if (action === "increase") selectedProducts[index].quantity++;
      if (action === "decrease" && selectedProducts[index].quantity > 1)
        selectedProducts[index].quantity--;
      updateBundle(); // Re-render bundle with updated quantity
    });
  });

  // Handle delete  button for each product
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      selectedProducts.splice(index, 1); // Remove from array
      updateBundle(); // Refresh UI
      resetAddButton(selectedProducts.map((p) => p.title)); // Reactivate "Add" button if needed
    });
  });

  // Calculate subtotal and discount
  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = selectedProducts.length >= 3 ? subtotal * 0.3 : 0;

  // Update discount and subtotal display
  discountAmount.innerText = `-$${discount.toFixed(2)} (${
    discount > 0 ? "30%" : "0%"
  })`;
  subtotalAmount.innerText = `$${(subtotal - discount).toFixed(2)}`;

  // Update progress bar to visually reflect how close user is to getting discount
  const progressPercent = Math.min((selectedProducts.length / 3) * 100, 100);
  document.getElementById("progress-fill").style.width = `${progressPercent}%`;

  // If cart has not been submitted, update cart button state
  if (!cartSubmitted) {
    cartButton.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <span>${
          selectedProducts.length >= 3
            ? "Proceed to Cart"
            : "Add 3 Items to Proceed"
        }</span>
        <span style="font-size:18px;">›</span>
      </div>
    `;
    cartButton.disabled = selectedProducts.length < 3;
  } else {
    // Reset cartSubmitted to allow new submissions
    cartSubmitted = false;
    initializeCartButton();
  }
}

// Update the button UI after a product is added to bundle
function updateButtonState(button, isAdded) {
  if (isAdded) {
    button.innerHTML = `Added to Bundle <span class="plus">✔</span>`;
    button.classList.add("added");
    button.disabled = true;
  }
}

// Reset buttons when a product is removed from the bundle
function resetAddButton(remainingTitles) {
  addButtons.forEach((button) => {
    const product = button.closest(".product");
    const title = product.querySelector(".product-title").innerText;
    if (!remainingTitles.includes(title)) {
      button.innerHTML = `Add to Bundle <span class="plus">+</span>`;
      button.classList.remove("added");
      button.disabled = false;
    }
  });
}

// Initializes cart button state depending on how many items are selected
function initializeCartButton() {
  cartButton.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
      <span>${
        selectedProducts.length >= 3
          ? "Proceed to Cart"
          : "Add 3 Items to Proceed"
      }</span>
      <span style="font-size:18px;">›</span>
    </div>
  `;
  cartButton.disabled = selectedProducts.length < 3;
}

// Cart button click handler – handles submission of bundle
cartButton.addEventListener("click", () => {
  if (selectedProducts.length >= 3) {
    cartSubmitted = true;

    // Show confirmation UI with checkmark
    cartButton.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <span>Added to Cart</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M20.285 6.709l-11.025 11.025-5.544-5.544 1.414-1.414 4.13 4.13 9.611-9.611z"/>
        </svg>
      </div>
    `;
    cartButton.disabled = true;
  } else {
    // Prevent cart submission if less than 3 products selected
    alert("Please add at least 3 products to get the 30% discount.");
  }
});
