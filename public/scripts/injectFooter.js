async function getfooter() {
    const response = await fetch("/components/footer.html");
    if (!response.ok) throw new Error (`HTTP error status: ${response.status}`);
    return await response.text();
}


document.addEventListener('DOMContentLoaded', async () => {
    const el = document.getElementById("site-footer");
    if (!el) return;

    try {
        el.innerHTML = await getfooter();
    } catch (err) {
        console.log(err)
        el.innerHTML = "<p>check the link for the footrer</p>"
    }
})