import { checkToken, request, showToast, showModal } from "./functions.js"

const username = document.getElementById("username")
const folders = document.getElementById("folders")
const notes = document.getElementById("notes")
const add_folder_btn = document.getElementById("add_folder_btn")
const textarea = document.getElementById("autoTextarea")
const textarea_btn = document.getElementById("textarea_btn")
const nav_mobile_icon = document.getElementById("nav_mobile_icon")
const nav_x_mobile_icon = document.getElementById("nav_x_mobile_icon")
const left_col = document.getElementById("left_col")
const right_col = document.getElementById("right_col")
const maxHeight = 180

const userId = localStorage.getItem("user_id")
const token = localStorage.getItem("token")

async function loadData() {
    const { data, error } = await request(
        `notebooks/user/${userId}/`,
        "GET",
        token
    )

    if (error) {
        return showToast({ text: error, type: "error", duration: 4000 })
    }

    data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    folders.innerHTML = ""

    for (let i = 0; i < data.length; i++) {
        const folder = document.createElement("div")
        folder.className = "folder"
        folder.id = data[i].id

        const content = document.createElement("p")
        content.className = "content"

        const icon = document.createElement("i")
        icon.className = "fas fa-folder"

        const titleText = document.createTextNode(" " + data[i].title)

        content.append(icon, titleText)

        const iconBox = document.createElement("div")
        iconBox.className = "folder_icon_box"

        const pencil = document.createElement("p")
        pencil.className = "folder_pencil fas fa-pencil-alt"

        const trash = document.createElement("p")
        trash.className = "folder_trash far fa-trash-alt"

        iconBox.append(pencil, trash)

        folder.append(content, iconBox)
        folders.appendChild(folder)
    }
}


async function loadDataNotes() {
    const folderId = localStorage.getItem("folderId")
    if (!folderId) return

    const { data, error } = await request(
        `notes/user/${userId}/folder/${folderId}`,
        "GET",
        token
    )

    if (error) {
        return showToast({ text: error, type: "error", duration: 4000 })
    }

    data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    notes.innerHTML = ""

    for (let i = 0; i < data.length; i++) {
        const note = document.createElement("div")
        note.className = `note ${data[i].type === "code" ? "code" : ""}`
        note.id = data[i].id

        const buttons = document.createElement("div")
        buttons.className = "buttons"

        const pencil = document.createElement("p")
        pencil.className = "note_pencil fas fa-pencil-alt"

        const trash = document.createElement("p")
        trash.className = "note_trash far fa-trash-alt"

        buttons.append(pencil, trash)

        const content = document.createElement("p")
        content.className = "content"
        content.textContent = data[i].content 

        note.append(buttons, content)
        notes.appendChild(note)
    }
}

folders.addEventListener("click", async (e) => {
    const folder = e.target.closest(".folder")
    if (!folder) return

    if (e.target.classList.contains("folder_pencil")) {
        const changedModalName = await showModal("Change Folder Name", "Yangi folderni nomini kiriting...")
        console.log(changedModalName)
        const { data, error, status } = await request(`notebooks/user/${userId}/notebook/${folder.id}`, "PUT", token, {
            title: changedModalName
        })
        if (error || status > 299) {
            return showToast({ text: "Folder nomini o'zgartirishda xatolik bo'ldi", type: "error", duration: 4000 });
        }
        showToast({ text: "Folder nomi muvaffaqiyatli o'zgartirildi", type: "success", duration: 4000 });
        loadData()

        return
    }
    if (e.target.classList.contains("folder_trash")) {
        const { data, error, status } = await request(`notebooks/user/${userId}/notebook/${folder.id}`, "DELETE", token)
        if (error || status > 299) {
            return showToast({ text: "Folder o'chirishda xatolik bo'ldi", type: "error", duration: 4000 });
        }
        showToast({ text: "Folder muvaffaqiyatli o'chirildi", type: "success", duration: 4000 });
        loadData()
        
        return  
    }

    const width = window.innerWidth;
    if (width < 768) {
        left_col.style.display = "none"
        right_col.style.display = "block"
    } 
    localStorage.setItem("folderId", folder.id)
    loadDataNotes()
})

notes.addEventListener("click", async (e) => {
    const note = e.target.closest(".note")
    if (!note) return
    const content = note.querySelector(".content")
    if (e.target.classList.contains("note_pencil")) {
        console.log(note.id)
        textarea_btn.textContent = "edit"
        textarea.value = content.textContent
        localStorage.setItem("type_button", "edit")
        localStorage.setItem("note_id", note.id)
    }
    if (e.target.classList.contains("note_trash")) {
        const { data, error } = await request(`notes/user/${userId}/note/${note.id}`, "DELETE", token)
        if (error) {
            return showToast({ text: "Folder o'chirishda xatolik yuz berdi", type: "error", duration: 4000 });
        }
        await loadDataNotes()
    }
})

add_folder_btn.addEventListener("click", async () => {
    const folder_name = await showModal("New Folder", "Folder nomini kiriting!")
    if (!folder_name) {
        return
    }
    const { data, error } = await request("notebooks", "POST", token,
        {
            "user_id": userId,
            "title": folder_name,
            "is_favorite": false
        }
    )
    console.log(data)
    if (error) {
        return showToast({ text: error, type: "error", duration: 4000 });
    }
    showToast({ text: "Folder muvaffaqiyatli qo'shildi", type: "success", duration: 4000 });
    loadData()

})

document.addEventListener("DOMContentLoaded", async () => {
    const success = await checkToken()
    if (success) {
        const { data, error } = await request(`users/${userId}`, "GET", token)
        if (error) {
            return showToast({ text: error, type: "error", duration: 4000 });
        }
        username.textContent = data.username
        await loadData()
        await loadDataNotes()
    } else {
        window.location.href = "./login"
    }
})

textarea.addEventListener("input", () => {
    textarea.style.height = "auto"
    
    if (textarea.scrollHeight <= maxHeight) {
        textarea.style.height = textarea.scrollHeight + "px"
        textarea.style.overflowY = "hidden"
        textarea.style.marginBottom = "0"
    } else {
        textarea.style.height = maxHeight + "px"
        textarea.style.overflowY = "auto"
        textarea.style.marginBottom = "40px"
    }
})

const code_mode = document.getElementById("code_mode")

let is_code_mode = false

code_mode.addEventListener("click", () => {
    if (is_code_mode) {
        is_code_mode = false
        code_mode.style.background = ""
    } else {
        is_code_mode = true
        code_mode.style.background = "black"
    }
})

textarea_btn.addEventListener("click", async () => {
    const folderId = localStorage.getItem("folderId")
    const text = textarea.value
    
    if (!folderId || text.length == 0) return
    
    const type_button = localStorage.getItem("type_button")
    if (type_button == "edit") {
        const noteId = localStorage.getItem("note_id")
        console.log("edit qilindi")
        console.log(folderId)
        console.log(noteId)
        const { data, error } = await request(`notes/user/${userId}/note/${noteId}`,"PUT", token, {
            content: text,
            type: is_code_mode ? "code" : "text"
        })
        if (error) {
            return showToast({ text: "Edit qilishda xatolik yuz berdi", type: "error", duration: 4000 });
        }
        console.log(data)
        showToast({ text: "Edit qilish muvaffaqiyatli bajarildi", type: "success", duration: 4000 });
        textarea.value = ""
        textarea_btn.textContent = "➤"
        localStorage.setItem("type_button", "")
        loadDataNotes()
        return 
    }

    const obj = {
        user_id: userId,
        notebook_id: folderId,
        content: text,
        type: is_code_mode ? "code" : "text",
        is_pinned: false,
        is_favorite: false
    }

    const { data, error } = await request("notes", "POST", token, obj)

    if (error) {
        return showToast({ text: error, type: "error", duration: 4000 });
    }

    textarea.value = ""
    loadDataNotes()
})

const exit_button = document.querySelector(".exit_button")

exit_button.addEventListener("click", () => {
    localStorage.clear()
    window.location.href = "/login"
})

nav_mobile_icon.addEventListener("click", () => {
    left_col.style.display = "block"
    right_col.style.display = "none"
})

nav_x_mobile_icon.addEventListener("click", () => {
    left_col.style.display = "none"
    right_col.style.display = "block"
})
