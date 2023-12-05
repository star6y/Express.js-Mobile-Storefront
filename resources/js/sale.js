async function isThereASale() {
    const res = await fetch("/api/sale", {
        method : "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    const json = await res.json(); //get response
    const msg = json.message //get actual message

    sale.textContent = msg;
}

setInterval(isThereASale, 1000);