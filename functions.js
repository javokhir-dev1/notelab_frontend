export async function checkToken() {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("user_id")

    if (!token || !userId) {
        return false
    }

    const { data, error, status } = await request(`users/${userId}`, "GET", token)
    console.log(status)
    if (error) {
        return false
    }

    return true
}

export async function request(url, method = "GET", token = null, body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    }

    if (token) {
        options.headers.Authorization = `Bearer ${token}`
    }

    if (body) {
        options.body = JSON.stringify(body)
    }

    try {
        const response = await fetch("https://javokhxrserver.duckdns.org/notelab/" + url, options)

        const status = response.status

        const data = await response.json().catch(() => null) // json bo‘lmasa null

        if (!response.ok) {
            return {
                data: null,
                error: data?.message || "So‘rovda xatolik",
                status,
            }
        }

        return {
            data,
            error: null,
            status,
        }
    } catch (error) {
        console.error("Fetch error:", error)
        return {
            data: null,
            error: error.message || "So‘rovda xatolik",
            status: null,
        }
    }
}

export function showToast({ text = '', type = 'info', duration = 3000 }) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    // Iconlar
    const icon = document.createElement('span');
    icon.classList.add('icon');
    if (type === 'success') icon.innerHTML = '<i class="fas fa-check-circle"></i>';
    else if (type === 'error') icon.innerHTML = '<i class="fas fa-times-circle"></i>';
    else if (type === 'warning') icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    else icon.innerHTML = '<i class="fas fa-info-circle"></i>';

    // Text
    const msg = document.createElement('span');
    msg.textContent = text;

    // Progress bar
    const progress = document.createElement('div');
    progress.classList.add('progress');
    progress.style.transition = `transform ${duration}ms linear`;

    toast.appendChild(icon);
    toast.appendChild(msg);
    toast.appendChild(progress);

    container.appendChild(toast);

    // Progress boshlanishi
    setTimeout(() => { progress.style.transform = 'scaleX(0)'; }, 50);

    // Avtomatik yo‘qolish
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

export function showModal(title, inputTitle) {
    return new Promise((resolve) => {
        // Modal overlay yaratish
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Modal oynasi
        const modal = document.createElement('div');
        modal.className = 'modal';

        // Title
        const h2 = document.createElement('h2');
        h2.innerText = title;

        // Input
        const input = document.createElement('input');
        input.placeholder = inputTitle;

        // Button
        const button = document.createElement('button');
        button.innerText = 'Submit';

        // Tugmani bosganda inputni tekshirish va return qilish
        button.addEventListener('click', () => {
            const value = input.value.trim();
            if (!value) {
                showToast({ text: "Iltimos, nimadur kiriting", type: "warning", duration: 3000 })
                input.focus();
                return;
            }
            document.body.removeChild(overlay); // modalni yopish
            resolve(value); // input qiymatini return qilish
        });

        const closeBtn = document.createElement('span');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '✕';

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null); // hech narsa kiritilmasa
        });
        modal.appendChild(closeBtn);
        // Modalni overlayga qo'shish
        modal.appendChild(h2);
        modal.appendChild(input);
        modal.appendChild(button);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Modalni ko'rsatish
        overlay.style.display = 'flex';
        input.focus(); // avtomatik focus
    });
}
