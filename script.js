document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // Load saved state
    checkboxes.forEach(box => {
        const savedState = localStorage.getItem(box.id);
        if (savedState === 'true') {
            box.checked = true;
            box.parentElement.classList.add('completed');
        }

        // Add click listener
        box.addEventListener('change', () => {
            localStorage.setItem(box.id, box.checked);
            if(box.checked) {
                box.parentElement.classList.add('completed');
            } else {
                box.parentElement.classList.remove('completed');
            }
            updateProgress();
        });
    });

    function updateProgress() {
        const total = checkboxes.length;
        const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
        const percent = Math.round((checked / total) * 100);

        progressBar.style.width = percent + '%';
        progressText.innerText = `${percent}% Completed`;
    }

    // Initial calculation
    updateProgress();
});
