/**
 * @param { string } message
 * @param { string } button1
 * @param { string } button2
 * @author MrVex
 * */
// start::Function
async function openMessage(message, button1, button2) {
	document.getElementById("openMessage").style.animation =
		"popIn 0.3s ease-out";
	document.getElementById("conFirmationMessage").style.display = "flex";
	let buttons = "";
	const i = document.querySelector(".modal-conFirmationMessage");

	function getAction(btn) {
		if (btn === "close" || btn === "ok") {
			return "closeconFirmationMessage()";
		} else if (btn === "yes") {
			return "clearLocalStorage()";
		} else if (btn === "no") {
			return "requestCancelled()";
		} else if (btn === "clearYes") {
			return "clearLocalStorage()";
		} else {
			throw new Error("that value is not acceptable");
		}
	}

	if (button1) {
		buttons += `<button onclick="${getAction(button1)}">${button1}</button>`;
	}
	if (button2) {
		buttons +=
			'<button onclick="' + getAction(button2) + '">' + button2 + "</button>";
	}

	i.innerHTML = `<div class="openMessage">${message}</div>${buttons}`;
}
// end::Function

let notes = JSON.parse(localStorage.getItem("d4rkNotes") || "[]");
let trash = JSON.parse(localStorage.getItem("d4rkTrash") || "[]");

function showSection(sectionId) {
	document
		.querySelectorAll(".section")
		.forEach((s) => s.classList.remove("active"));
	document.getElementById(sectionId + "Section").classList.add("active");
	updateLists();
}

function toggleMenu() {
	const navButtons = document.getElementById("navButtons");
	navButtons.style.display =
		navButtons.style.display === "flex" ? "none" : "flex";
}

function addNote() {
	const title = document.getElementById("newNoteInput").value;
	if (title) {
		notes.push({
			title: title,
			content: "",
			timestamp: new Date().toLocaleString(),
		});
		localStorage.setItem("d4rkNotes", JSON.stringify(notes));
		document.getElementById("newNoteInput").value = "";
		updateLists();
	}
}

function clearLocalStorageRequest() {
	if (
		localStorage.getItem("d4rkNotes") === null &&
		localStorage.getItem("d4rkTrash") === null
	) {
		openMessage("No data to clear! LocalStorage is already empty.", "ok");
	} else {
		openMessage(
			"Are you sure? This will permanently delete ALL notes and trash from localStorage!",
			"yes",
			"no"
		);
	}
}
function editNote() {
	const title = document.getElementById("newNoteInput").value;
	if (title) {
		const note = notes.find((n) => n.title === title);
		if (note) {
			document.getElementById("editNoteInput").value = note.content || "";
			document.getElementById("editModal").style.display = "flex";
		} else {
			openMessage("No note found with that title!", "ok");
		}
	}
}

function saveEditedNote() {
	const title = document.getElementById("newNoteInput").value;
	const content = document.getElementById("editNoteInput").value;
	if (title) {
		const note = notes.find((n) => n.title === title);
		if (note) {
			note.content = content;
			note.timestamp = new Date().toLocaleString();
			localStorage.setItem("d4rkNotes", JSON.stringify(notes));
			closeModal();
			updateLists();
			openMessage("Note edited!", "ok");
		}
	}
}

function deleteNote() {
	const title = document.getElementById("newNoteInput").value;
	if (title && notes.length > 0) {
		const index = notes.findIndex((n) => n.title === title);
		if (index !== -1) {
			const deletedNote = notes.splice(index, 1)[0];
			trash.push(deletedNote);
			localStorage.setItem("d4rkNotes", JSON.stringify(notes));
			localStorage.setItem("d4rkTrash", JSON.stringify(trash));
			document.getElementById("newNoteInput").value = "";
			updateLists();
			openMessage("Note deleted!", "ok");
		} else {
			openMessage("No note found with that title!", "ok");
		}
	}
}

function restoreNote() {
	const selected = document.querySelector(".trash-item.selected");
	if (selected) {
		const title = selected.textContent.split(" (Deleted:")[0];
		const index = trash.findIndex((n) => n.title === title);
		if (index !== -1) {
			const restoredNote = trash.splice(index, 1)[0];
			notes.push(restoredNote);
			localStorage.setItem("d4rkNotes", JSON.stringify(notes));
			localStorage.setItem("d4rkTrash", JSON.stringify(trash));
			updateLists();
		}
	}
}

function emptyTrash() {
	trash = [];
	localStorage.setItem("d4rkTrash", JSON.stringify(trash));
	updateLists();
	closeconFirmationMessage();
}

function emptyTrashRequest() {
	if (localStorage.getItem("d4rkTrash").value == "") {
		openMessage("Your Trash Is Already Empty", "ok");
	} else {
		openMessage(
			"Are You Sure To Empty Your Trash?, It Will Delete All The Note Inside Your Trash Permanently",
			"yes",
			"no"
		);
	}
}

function clearLocalStorage() {
	localStorage.removeItem("d4rkNotes");
	localStorage.removeItem("d4rkTrash");
	localStorage.removeItem("d4rkWallpaper"); // Clear wallpaper
	notes = [];
	trash = [];
	document.body.style.backgroundImage = "none"; // Reset to default
	originalBackground = "none";
	updateLists();
	closeconFirmationMessage();
	openMessage("All data cleared from localStorage!", "ok");
}

function requestCancelled() {
	openMessage("emtyTrash Request Canceled", "close");
}

function updateLists() {
	const noteList = document.getElementById("noteList");
	const trashList = document.getElementById("trashList");

	noteList.innerHTML = "";
	trashList.innerHTML = "";

	notes.forEach((note) => {
		if (note.title && note.content !== undefined) {
			const div = document.createElement("div");
			div.className = "note-item";
			div.textContent = `${note.title} (${note.timestamp})`;
			div.onclick = () =>
				(document.getElementById("newNoteInput").value = note.title);
			noteList.appendChild(div);
		}
	});

	trash.forEach((note) => {
		if (note.title && note.content !== undefined) {
			const div = document.createElement("div");
			div.className = "trash-item";
			div.textContent = `${note.title} (Deleted: ${note.timestamp})`;
			div.onclick = () => {
				div.classList.toggle("selected");
			};
			trashList.appendChild(div);
		}
	});
}

let wallpapers = {}; // Initialize empty
let isWallpapersLoaded = false;

const rawUrl = "https://alex-furansu.github.io/wllpjson/list.json";

async function loadWallpapers() {
	try {
		const response = await fetch(rawUrl);
		if (!response.ok) throw new Error("Failed to fetch");
		wallpapers = await response.json(); // Loads your JSON into wallpapers object
		isWallpapersLoaded = true;
		console.log("Wallpapers loaded from GitHub:", wallpapers);
	} catch (error) {
		console.error("Error loading wallpapers:", error);
		openMessage("Failed to load wallpapers from GitHub!", "ok");
		// Fallback to empty or defaults if needed
		wallpapers = { cp: [], pc: [] };
		isWallpapersLoaded = true;
	}
}

let originalBackground = document.body.style.backgroundImage || "none";
let selectedWallpaper = null;

function openWallpaperModal() {
	if (!isWallpapersLoaded) {
		openMessage("Loading wallpapers...", "ok");
		return;
	}
	document.getElementById("wallpaperModal").style = "display: flex;";
	// Reset selections
	document.querySelectorAll(".wallpaper-preview").forEach((preview) => {
		preview.classList.remove("selected");
	});
	selectedWallpaper = null;

	// Populate previews
	const cellphoneGrid = document.getElementById("cellphone-previews");
	const pcGrid = document.getElementById("pc-previews");
	cellphoneGrid.innerHTML = "";
	pcGrid.innerHTML = "";

	// Cellphone previews
	wallpapers.cp.forEach((wp, index) => {
		const preview = document.createElement("div");
		preview.className = "wallpaper-preview";
		const wallpaperId = `cp_${index}`;
		preview.dataset.wallpaper = wallpaperId;
		preview.innerHTML = `
            <img src="${wp.url}" alt="${wp.title}" />
            <span>${wp.title}</span>
        `;
		preview.onclick = () => previewWallpaper(wallpaperId);
		cellphoneGrid.appendChild(preview);
	});

	// PC previews
	wallpapers.pc.forEach((wp, index) => {
		const preview = document.createElement("div");
		preview.className = "wallpaper-preview";
		const wallpaperId = `pc_${index}`;
		preview.dataset.wallpaper = wallpaperId;
		preview.innerHTML = `
            <img src="${wp.url}" alt="${wp.title}" />
            <span>${wp.title}</span>
        `;
		preview.onclick = () => previewWallpaper(wallpaperId);
		pcGrid.appendChild(preview);
	});

	// Highlight current wallpaper
	const savedWallpaper = localStorage.getItem("d4rkWallpaper");
	if (savedWallpaper) {
		Object.keys(wallpapers).forEach((category) => {
			wallpapers[category].forEach((wp, index) => {
				if (wp.url === savedWallpaper) {
					const wallpaperId = `${category}_${index}`;
					const preview = document.querySelector(
						`.wallpaper-preview[data-wallpaper="${wallpaperId}"]`
					);
					if (preview) {
						preview.classList.add("selected");
						console.log("Highlighted current wallpaper:", wallpaperId);
					}
				}
			});
		});
	}
}

function previewWallpaper(wallpaperId) {
	const [category, index] = wallpaperId.split("_");
	const wallpaper = wallpapers[category][parseInt(index)];
	if (!wallpaper) {
		console.error("Wallpaper not found:", wallpaperId);
		openMessage("Invalid wallpaper selected!", "ok");
		return;
	}

	console.log("Previewing:", wallpaper.title, wallpaperId); // Debug
	const fullUrl =
		wallpaper.url +
		(wallpaper.url.includes("?") ? "&" : "?") +
		"t=" +
		Date.now();

	const img = new Image();
	img.onload = () => {
		console.log("Preview loaded:", wallpaperId); // Debug
		document.body.style.backgroundImage = `url('${wallpaper.url}')`;
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundPosition = "center";
		document.body.style.backgroundRepeat = "no-repeat";
		document.querySelectorAll(".wallpaper-preview").forEach((preview) => {
			preview.classList.remove("selected");
		});
		const selectedPreview = document.querySelector(
			`.wallpaper-preview[data-wallpaper="${wallpaperId}"]`
		);
		if (selectedPreview) {
			selectedPreview.classList.add("selected");
		}
		selectedWallpaper = wallpaperId;
		console.log("selectedWallpaper set to:", selectedWallpaper); // Debug
	};
	img.onerror = () => {
		console.error("Failed to load preview:", wallpaper.url);
		openMessage(`Failed to load ${wallpaper.title} preview!`, "ok");
		document.body.style.backgroundImage = originalBackground;
	};
	img.src = fullUrl;
}

function setWallpaper(wallpaperId) {
	const [category, index] = wallpaperId.split("_");
	const wallpaper = wallpapers[category][parseInt(index)];
	if (!wallpaper) {
		console.error("Wallpaper not found:", wallpaperId);
		openMessage("Invalid wallpaper selected!", "ok");
		return;
	}

	console.log("Applying:", wallpaper.title, wallpaperId);
	const fullUrl =
		wallpaper.url +
		(wallpaper.url.includes("?") ? "&" : "?") +
		"t=" +
		Date.now();
	const cleanUrl = wallpaper.url;

	const img = new Image();
	img.onload = () => {
		console.log("Applied:", wallpaperId);
		document.body.style.backgroundImage = `url('${cleanUrl}')`;
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundPosition = "center";
		document.body.style.backgroundRepeat = "no-repeat";
		originalBackground = `url('${cleanUrl}')`;
		localStorage.setItem("d4rkWallpaper", cleanUrl); // Save URL to localStorage
		closeModal();
		openMessage(`${wallpaper.title} wallpaper set!`, "ok");
	};
	img.onerror = () => {
		console.error("Failed to apply:", wallpaper.url);
		document.body.style.backgroundImage = originalBackground;
		openMessage(`Failed to apply ${wallpaper.title}! Reverted.`, "ok");
	};
	img.src = fullUrl;
}

function applyWallpaper() {
	console.log("Apply clicked, selectedWallpaper:", selectedWallpaper); // Debug
	if (selectedWallpaper) {
		setWallpaper(selectedWallpaper);
	} else {
		openMessage("Please select a wallpaper first!", "ok");
	}
}
// New function to cancel and revert
function cancelWallpaper() {
	document.body.style.backgroundImage = originalBackground; // Restore original
	closeModal();
}

function closeconFirmationMessage() {
	document.getElementById("openMessage").style.animation =
		"popOut 0.3s ease-out";
	setTimeout(() => {
		document.getElementById("conFirmationMessage").style.display = "none";
	}, 300);
}
function closeModal() {
	document.getElementById("editModal").style.display = "none";
	document.getElementById("wallpaperModal").style.display = "none";
	document.getElementById("editNoteInput").value = "";
}

function display_ct7() {
	var x = new Date();
	var hours = x.getHours();
	var ampm = hours >= 12 ? " PM" : " AM";
	hours = hours % 12;
	hours = hours ? hours : 12;
	hours = hours.toString().length == 1 ? "0" + hours.toString() : hours;
	var minutes = x.getMinutes().toString();
	minutes = minutes.length == 1 ? "0" + minutes : minutes;
	var seconds = x.getSeconds().toString();
	seconds = seconds.length == 1 ? "0" + seconds : seconds;
	var month = (x.getMonth() + 1).toString();
	month = month.length == 1 ? "0" + month : month;
	var dt = x.getDate().toString();
	dt = dt.length == 1 ? "0" + dt : dt;
	var x1 = month + "/" + dt + "/" + x.getFullYear();
	x1 = x1 + " - " + hours + ":" + minutes + ":" + seconds + " " + ampm;
	document.getElementById("timeDisplay").innerHTML = x1;
	display_c7();
}

function display_c7() {
	var refresh = 1000;
	mytime = setTimeout(display_ct7, refresh);
}

// Update window.onload to fetch on load
window.onload = async () => {
	await loadWallpapers(); // Load from your raw URL

	// Load saved wallpaper (from previous localStorage setup)
	const savedWallpaper = localStorage.getItem("d4rkWallpaper");
	if (savedWallpaper) {
		const img = new Image();
		img.onload = () => {
			document.body.style.backgroundImage = `url('${savedWallpaper}')`;
			document.body.style.backgroundSize = "cover";
			document.body.style.backgroundPosition = "center";
			document.body.style.backgroundRepeat = "no-repeat";
			originalBackground = `url('${savedWallpaper}')`;
			console.log("Loaded saved wallpaper:", savedWallpaper);
		};
		img.onerror = () => {
			console.error("Failed to load saved wallpaper:", savedWallpaper);
			document.body.style.backgroundImage = "none";
			originalBackground = "none";
		};
		img.src = savedWallpaper;
	}

	updateLists();
	showSection("notes");
	display_ct7();
};
