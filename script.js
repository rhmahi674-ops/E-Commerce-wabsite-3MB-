let products = [
  {
    
    name: "Elegura Handmade Home Decor Items(8 pieces product price) ",
    price: 2500,
    video: "vdo1.mp4",
    img: ""
  },
  {
    id: 2,
    name: "Home Decor Light ",
    price: 1000,
    img: "img2.jpg"
  },
  {
    id: 3,
    name: "Flower Vase",
    price: 250,
    img: "img3.jpg"
  },
  {
    id: 4,
    name: "Churi, Hijab & Clip Hangers",
    price: 500,
    img: "img4.jpg"
  },
  {
    id: 5,
    name: "Crochet Pencil Case",
    price: 600,
    img: "img6.jpeg"
  },
  {
    id:6 ,
    name: "Crochet Heart Trinket Tray",
    price: 300,
    img: "img9.jpeg"
  },
  {
    id: 7,
    name: "Crochet Forever Gajra",
    price: 400,
    img: "img5.jpeg"
  },
  {
    id: 8,
    name: "Red & Stone Work Churi",
    price: 300,
    img: "img7.jpg"
  },
  {
    id: 9,
    name: "Black & Brown Churi",
    price: 280,
    img: "img8.jpg"
  },
  {
    id: 10,
    name: "Rainbow & Stone Work Churi",
    price: 350,
    img: "img10.jpg"
  }
];

let cart = [];

function add(){
  let name = document.getElementById("dName").innerText;
  let price = document.getElementById("dPrice").innerText;
  let qty = document.getElementById("qty").innerText;

  cart.push({
    name: name,
    price: price,
    qty: qty
  });

  updateCart();
}

/* PAGE SWITCH */
function show(id){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.remove('active');
  });

  document.getElementById(id).classList.add('active');

  window.scrollTo(0,0);
}

/* RENDER PRODUCTS */
function renderProducts(list){
  let box = document.getElementById('list');
  box.innerHTML = "";

  list.forEach(p=>{
    box.innerHTML += `
      <div class="card" onclick="openD(${p.id})">

        ${
          p.video 
          ? `<video src="${p.video}" muted autoplay loop></video>`
          : `<img src="${p.img}">`
        }

        <h4>${p.name}</h4>
        <p>${p.price} BDT</p>

      </div>
    `;
  });
}

/* LOAD */
function load(){
  renderProducts(products);
}

/* PRODUCT DETAIL */
function openD(id){
  selected = products.find(p => p.id === id);

  quantity = 1;
  document.getElementById('qty').innerText = quantity;

  document.getElementById('dName').innerText = selected.name;
  document.getElementById('dPrice').innerText = selected.price + " BDT";

  if(selected.video){
    document.getElementById('dImg').style.display = "none";
  }else{
    document.getElementById('dImg').style.display = "block";
    document.getElementById('dImg').src = selected.img;
  }

  show('detail');
}

/* QUANTITY */
function inc(){
  quantity++;
  document.getElementById('qty').innerText = quantity;
}

function dec(){
  if(quantity > 1){
    quantity--;
    document.getElementById('qty').innerText = quantity;
  }
}

/* ADD TO CART */
function add(){
  let exist = cart.find(i => i.id === selected.id);

  if(exist){
    exist.qty += quantity;
  } else {
    cart.push({...selected, qty:quantity});
  }

  update();
  toggleCart();
}

/* BUY NOW */
function buyNow(){
  add();
  show('order');
}

/* CART TOGGLE */
function toggleCart(){
  document.getElementById('cartBox').classList.toggle('active');
}

/* UPDATE */
function update(){
  document.getElementById('count').innerText = cart.length;
  renderCart();
}

/* REMOVE */
function removeItem(id){
  cart = cart.filter(i => i.id !== id);
  update();
}

/* CART RENDER */
function renderCart(){
  let box = document.getElementById('cartItems');
  box.innerHTML = "";

  let total = 0;

  cart.forEach(i=>{
    box.innerHTML += `
      <div>
        ${i.name} (${i.qty}) - ${i.price * i.qty} BDT
        <button onclick="removeItem(${i.id})">X</button>
      </div>
    `;
    total += i.price * i.qty;
  });

  let delivery = 150;
  let grand = total + delivery;

  document.getElementById('bill').innerHTML =
  `Subtotal: ${total}<br>Delivery: ${delivery}<br><b>Total: ${grand}</b>`;
}

/* SEARCH */
function search(){
  let v = document.getElementById('searchInput').value.toLowerCase();

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(v)
  );

  renderProducts(filtered);
}
function show(page){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
}
/* ORDER */
function placeOrder(){

  let payment = document.querySelector('input[name="payment"]:checked');

  if(!payment){
    alert("Please select payment method!");
    return;
  }

  let email = document.getElementById('oEmail').value;
  let name = document.getElementById('oName').value;
  let addr = document.getElementById('oAddress').value;
  let phone = document.getElementById('oPhone').value;

  if(!email || !name || !addr || !phone){
    alert("Fill all fields");
    return;
  }

  // 🔥 GET CART SAFE
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length === 0){
    alert("Cart is empty!");
    return;
  }

  // 🔥 GET OLD ORDERS
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // 🔥 NEW ORDER
  let newOrder = {
    id: Date.now(),
    email,
    name,
    address: addr,
    phone,
    items: cart,
    date: new Date().toLocaleString(),
    status: "Processing"
  };

  orders.push(newOrder);

  // 🔥 SAVE
  localStorage.setItem("orders", JSON.stringify(orders));

  // clear cart
  localStorage.setItem("cart", JSON.stringify([]));

  alert("Order placed successfully!");

  show('home');
}

/* INIT */
load();
document.getElementById('order').classList.remove('active');
// LOGIN SYSTEM ADD

let isLoggedIn = localStorage.getItem("login") === "true";
let userEmail = localStorage.getItem("email") || "";

updateLoginUI();

function openLogin(){
  document.getElementById("overlay").classList.add("active");
}

function closeLogin(){
  document.getElementById("overlay").classList.remove("active");
}

function goNext(){
  let input = document.getElementById("userInput").value;

  if(input === ""){
    alert("Enter email");
  } else {
    isLoggedIn = true;
    userEmail = input;

    localStorage.setItem("login","true");
    localStorage.setItem("email",input);

    closeLogin();
    updateLoginUI();
  }
}

function updateLoginUI(){
  let text = document.getElementById("userText");

  if(text){
    if(isLoggedIn){
      // email থেকে name বের করবো
      let name = userEmail.split("@")[0];

      text.innerText = name; // শুধু নাম দেখাবে
    } else {
      text.innerText = "Sign in";
    }
  }
}

function toggleDropdown(){
  if(!isLoggedIn){
    openLogin();
    return;
  }

  document.getElementById("dropdown").classList.toggle("active");
}

function logout(){
  isLoggedIn = false;
  userEmail = "";

  localStorage.removeItem("login");
  localStorage.removeItem("email");

  updateLoginUI();
  document.getElementById("dropdown").classList.remove("active");
}

// বাইরে click করলে dropdown বন্ধ
window.onclick = function(e){
  if(!e.target.closest(".login-area")){
    let d = document.getElementById("dropdown");
    if(d) d.classList.remove("active");
  }
}
// ORDER FLOW CONTROL (Rokomari style)

let pendingOrder = false;

// order click করলে
function checkLoginAndOrder(){
  if(!isLoggedIn){
    pendingOrder = true;   // 🔥 মনে রাখবে user order করতে চেয়েছিল
    openLogin();           // login popup open
  } else {
    show("order");
  }
}

// login করার পর auto order open
function goNext(){
  let input = document.getElementById("userInput").value;

  if(input === ""){
    alert("Enter email");
  } else {
    isLoggedIn = true;
    userEmail = input;

    localStorage.setItem("login","true");
    localStorage.setItem("email",input);

    closeLogin();
    updateLoginUI();

    // 🔥 IMPORTANT PART
    if(pendingOrder){
      pendingOrder = false;
      show("order");   // login শেষে order open
    }
  }
}
function trackOrder(){

  let id = document.getElementById("trackInput").value;

  if(id === ""){
    alert("Enter Order ID");
    return;
  }

  document.getElementById("trackResult").style.display = "block";
  document.getElementById("trackId").innerText = "Order ID: " + id;
  document.getElementById("trackStatus").innerText = "Live Tracking Started...";

  // reset all steps first
  document.querySelectorAll(".line-step").forEach(step=>{
    step.classList.remove("active");
  });

  // fake live tracking animation
  setTimeout(()=> activate("s1"), 500);
  setTimeout(()=> activate("s2"), 1200);
  setTimeout(()=> activate("s3"), 2000);
  setTimeout(()=> activate("s4"), 2800);
}

function activate(id){
  let el = document.getElementById(id);
  if(el){
    el.classList.add("active");
  }
}