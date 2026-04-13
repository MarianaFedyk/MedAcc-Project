document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch('/me', {
            credentials: 'include'
        });

        const data = await res.json();

        const redaction = document.querySelector('.block-redaction');
        const report = document.querySelector('.block-report');
        const lastActions = document.querySelector('.block-LastActions');

        if (!data.isAdmin) {
            if (redaction) redaction.style.display = 'none';
            if (report) report.style.display = 'none';
            if (lastActions) lastActions.style.display = 'none';
        }

    } catch (err) {
        console.error(err);
    }
});