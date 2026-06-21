const video = document.getElementById("video");
const canvas = document.getElementById("stripCanvas");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");
const flash = document.getElementById("flash");
const themeSelect = document.getElementById("themeSelect");

let photos = [];

startCamera();

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
  } catch (error) {
    alert("Camera failed! Please allow permissions.");
    console.log(error);
  }
}

async function startBooth() {
  photos = [];
  for (let i = 0; i < 4; i++) {
    await doCountdown();
    await takePhoto();
    await wait(500);
  }
  generateStrip();
  // ถ่ายเสร็จจะเด้งหน้าต่างพรีวิวแผ่นฟิล์มรวม 4 รูปให้อัตโนมัติก่อน
  downloadStrip(); 
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function doCountdown() {
  return new Promise((resolve) => {
    let count = 3;
    countdown.style.display = "block";
    countdown.innerText = count;
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.innerText = count;
      } else {
        clearInterval(interval);
        countdown.style.display = "none";
        flashEffect();
        resolve();
      }
    }, 1000);
  });
}

function flashEffect() {
  flash.style.opacity = "1";
  setTimeout(() => { flash.style.opacity = "0"; }, 150);
}

function takePhoto() {
  return new Promise((resolve) => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0);
    
    const image = new Image();
    image.onload = () => {
      photos.push(image);
      resolve();
    };
    image.src = tempCanvas.toDataURL("image/png");
  });
}

function generateStrip() {
  canvas.width = 400;
  canvas.height = 1350;
  
  let theme = themeSelect.value;
  let bgColor = "white";
  let textColor = "black";
  
  if (theme === "pink") bgColor = "#ffd6ec";
  if (theme === "black") { bgColor = "#222"; textColor = "white"; }
  if (theme === "blue") bgColor = "#cfefff";
  if (theme === "retro") bgColor = "#f5deb3";
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = textColor;
  ctx.font = "bold 28px Arial";
  ctx.fillText("✨ PIXIE PHOTOBOOTH ✨", 25, 50);
  
  let y = 100;
  photos.forEach((photo, index) => {
    ctx.drawImage(photo, 25, y, 350, 250);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(25, y, 350, 250);
    
    ctx.font = "20px Arial";
    ctx.fillText("📸 Shot " + (index + 1), 140, y + 275);
    y += 300;
  });
  
  ctx.font = "20px Arial";
  const date = new Date().toLocaleDateString();
  ctx.fillText(date, 120, 1320);
}

// 🆕 ฟังก์ชันสร้างรูปเดี่ยวแบบ "มีกรอบแยกทีละใบตามธีม"
function createSingleFramedPhoto(photo, index) {
  const singleCanvas = document.createElement("canvas");
  singleCanvas.width = 400;
  singleCanvas.height = 360; // จัดสัดส่วนให้เหลือขอบด้านล่างสำหรับใส่ข้อความคิวท์ๆ
  const sCtx = singleCanvas.getContext("2d");
  
  let theme = themeSelect.value;
  let bgColor = "white";
  let textColor = "black";
  
  if (theme === "pink") bgColor = "#ffd6ec";
  if (theme === "black") { bgColor = "#222"; textColor = "white"; }
  if (theme === "blue") bgColor = "#cfefff";
  if (theme === "retro") bgColor = "#f5deb3";
  
  // เทสีพื้นหลังกรอบเดี่ยว
  sCtx.fillStyle = bgColor;
  sCtx.fillRect(0, 0, singleCanvas.width, singleCanvas.height);
  
  // วาดรูปถ่ายลงไปตรงกลาง
  sCtx.drawImage(photo, 25, 25, 350, 250);
  sCtx.strokeStyle = textColor;
  sCtx.lineWidth = 5;
  sCtx.strokeRect(25, 25, 350, 250);
  
  // ใส่ตัวอักษรกำกับช็อตและวันที่ด้านล่างรูปเดี่ยว
  sCtx.fillStyle = textColor;
  sCtx.font = "bold 20px Arial";
  sCtx.fillText("📸 Shot " + (index + 1), 35, 320);
  
  sCtx.font = "16px Arial";
  const date = new Date().toLocaleDateString();
  sCtx.fillText(date, 280, 320);
  
  return singleCanvas.toDataURL("image/png");
}

// ฟังก์ชันกดเซฟแบบรวมแผ่นยาว (เรียง 4)
function downloadStrip() {
  if (photos.length === 0) { alert("กรุณาถ่ายรูปก่อนน้าา~ 💕"); return; }
  
  const dataUrl = canvas.toDataURL("image/png");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    showMobileOverlay([dataUrl], "✨ แตะค้างที่แผ่นฟิล์ม เพื่อบันทึกแบบเรียง 4 รูปได้เลยค่ะ! ✨");
  } else {
    const link = document.createElement("a");
    link.download = "pixie-photostrip.png";
    link.href = dataUrl;
    link.click();
  }
}

// 🆕 ฟังก์ชันกดเซฟแบบแยกทีละรูป (มีกรอบ)
function downloadIndividual() {
  if (photos.length === 0) { alert("กรุณาถ่ายรูปก่อนน้าา~ 💕"); return; }
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const imageSources = photos.map((photo, index) => createSingleFramedPhoto(photo, index));
  
  if (isMobile) {
    showMobileOverlay(imageSources, "✨ แตะค้างที่รูปถ่ายแต่ละใบ เพื่อบันทึกแยกรูปได้เลยค่ะ! ✨");
  } else {
    // บนคอมพิวเตอร์ทั่วไป จะดาวน์โหลดไฟล์แยกเป็น 4 ไฟล์ให้ทันที
    imageSources.forEach((url, index) => {
      const link = document.createElement("a");
      link.download = `pixie-shot-${index + 1}.png`;
      link.href = url;
      link.click();
    });
  }
}

// 🆕 ตัวจัดการหน้าต่างป๊อปอัปสำหรับ iPad/มือถือ เพื่อให้เซฟรูปได้ง่ายและสมบูรณ์ 100%
function showMobileOverlay(imageUrls, titleText) {
  let overlay = document.getElementById("mobileOverlay");
  
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "mobileOverlay";
    // จัดตำแหน่งให้อยู่บนสุดและเปิดสกรอลล์ดาวน์โหลดรูปภาพแนวตั้งได้
    overlay.style.position = "fixed";
    overlay.style.top = "0"; overlay.style.left = "0";
    overlay.style.width = "100vw"; overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
    overlay.style.backdropFilter = "blur(8px)";
    overlay.style.webkitBackdropFilter = "blur(8px)";
    overlay.style.zIndex = "9999";
    overlay.style.overflowY = "auto";
    overlay.style.padding = "30px 20px";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.gap = "20px";
    document.body.appendChild(overlay);
  }
  
  overlay.innerHTML = ""; // ล้างข้อมูลเดิมออกก่อน
  
  // สร้างปุ่มปิดดีไซน์น่ารักนุ่มนวล
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "❌ CLOSE / ปิดหน้าต่าง";
  closeBtn.style.padding = "12px 24px";
  closeBtn.style.borderRadius = "15px";
  closeBtn.style.border = "none";
  closeBtn.style.backgroundColor = "#ff7597";
  closeBtn.style.color = "white";
  closeBtn.style.fontWeight = "bold";
  closeBtn.style.fontSize = "15px";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => overlay.style.display = "none";
  overlay.appendChild(closeBtn);
  
  // คำแนะนำการเซฟ
  const info = document.createElement("p");
  info.innerText = titleText;
  info.style.color = "white";
  info.style.fontWeight = "bold";
  info.style.fontSize = "15px";
  info.style.margin = "0";
  info.style.textAlign = "center";
  overlay.appendChild(info);
  
  // วาดรูปภาพลงในป๊อปอัป (หากเลือกแบบแยกรูป จะเรียงลงมาให้กดเซฟครบทั้ง 4 ใบ)
  imageUrls.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "85vw";
    img.style.maxHeight = "65vh";
    img.style.borderRadius = "15px";
    img.style.border = "5px solid white";
    img.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
    overlay.appendChild(img);
  });
  
  overlay.style.display = "flex";
}
