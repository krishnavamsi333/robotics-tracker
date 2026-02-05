// 1. CONFIGURATION (REPLACE THIS WITH YOURS)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let tasks = [];
const statuses = ["todo", "progress", "review", "done"];

// 2. AUTHENTICATION LOGIC
function toggleAuth() {
    if (!auth.currentUser) {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    } else {
        auth.signOut();
    }
}

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("authStatus").innerText = "● SYSTEM_ONLINE";
        document.getElementById("authStatus").classList.add("status-active");
        document.getElementById("loginBtn").innerText = "LOGOUT";
        document.getElementById("userGreeting").innerText = `HI_${user.displayName.toUpperCase().split(' ')[0]}`;
        document.getElementById("navControls").style.display = "block";
        syncTasks();
    } else {
        document.getElementById("authStatus").innerText = "● OFFLINE";
        document.getElementById("loginBtn").innerText = "LOGIN WITH GOOGLE";
        document.getElementById("userGreeting").innerText = "WELCOME_ANON";
        document.getElementById("navControls").style.display = "none";
        tasks = [];
        render();
    }
});

// 3. CLOUD DATA LOGIC
function syncTasks() {
    const userId = auth.currentUser.uid;
    db.collection("tasks")
      .where("userId", "==", userId)
      .onSnapshot(snapshot => {
          tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          render();
      });
}

async function openTask() {
    const t = prompt("INPUT_TASK_DATA:");
    if (!t || !auth.currentUser) return;

    await db.collection("tasks").add({
        title: t,
        status: "todo",
        userId: auth.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

async function deleteTask(id) {
    await db.collection("tasks").doc(id).delete();
}

async function drop(status) {
    if (!dragged) return;
    await db.collection("tasks").doc(dragged).update({ status: status });
}

// 4. UI RENDERING
function render() {
    document.getElementById("total").innerText = tasks.length.toString().padStart(2, '0');
    document.getElementById("done").innerText = tasks.filter(t => t.status === "done").length.toString().padStart(2, '0');

    const board = document.getElementById("board");
    board.innerHTML = statuses.map(s => `
        <div class="column" data-status="${s}" ondragover="event.preventDefault()" ondrop="drop('${s}')">
            <h3>// ${s.toUpperCase()} (${tasks.filter(t => t.status === s).length})</h3>
            ${tasks.filter(t => t.status === s).map(t => `
                <div class="card" draggable="true" ondragstart="dragged='${t.id}'">
                    <button class="delete-btn" onclick="deleteTask('${t.id}')">×</button>
                    <div>${t.title}</div>
                    <small style="color:#444; font-size:9px;">NODE_${t.id.substring(0,5)}</small>
                </div>`).join("")}
        </div>`).join("");
}

let dragged = null;
render();