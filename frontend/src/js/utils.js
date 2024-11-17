export function capitalizeFirstLetter(message) {
	return message.charAt(0).toUpperCase() + message.slice(1);
}

export function showMessage(message) {
    if (!message) return;
    const messagePopup = document.createElement('div');
    messagePopup.className = 'message-popup position-fixed start-50 translate-middle-x bg-warning text-white p-2 rounded opacity-0 transition-opacity';
    messagePopup.textContent = message;
    document.body.appendChild(messagePopup);

    setTimeout(() => {
        messagePopup.classList.add('opacity-100');
    }, 10);

    setTimeout(() => {
        messagePopup.classList.remove('opacity-100');
        setTimeout(() => {
            document.body.removeChild(messagePopup);
        }, 500);
    }, 3000);
}