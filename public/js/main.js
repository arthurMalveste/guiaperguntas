document.addEventListener("DOMContentLoaded", function() {
    const notification = document.querySelector('.notifi');
    if (notification) {
        notification.addEventListener('animationend', function() {
            notification.classList.add('hidden');
        });
    }
});
