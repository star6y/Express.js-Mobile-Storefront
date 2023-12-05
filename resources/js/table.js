const rows = document.querySelectorAll("tr");
// this code loops through each tr tag, finds it's button
// and sets up an event listner for that button
rows.forEach((row) => {
    const btn = row.querySelector("button");
    if (btn) {
    btn.addEventListener("click", async del => {
        const rowID = row.className

        //continue from here
        const res = await fetch("/api/contact", {
            method : "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"id": rowID})
        });
        console.log(res)
        if (res.status === 200 || res.status === 404) {
            row.remove()
            confirmRowDelete("Row removed")
            setTimeout(confirmRowDelete, 4000, "")
        }
        // const serverReply = await res.json();

        // console.log(res);
    }) }
});




const confirmationRowDelete = document.getElementById("confirmationSale");
const confirmationSaleEvent = document.getElementById("confirmationRowDel");

// set visability to visible or hidden depending on context of event
function confirmRowDelete (text) {
    if (text === "") {
        confirmationRowDelete.style.visibility = "hidden";
        confirmationRowDelete.style.marginBottom   = "0";
        confirmationRowDelete.style.marginTop = "0";
    } else {
        confirmationRowDelete.style.visibility = "visible";
        confirmationRowDelete.style.marginBottom  = "1%";
        confirmationRowDelete.style.marginTop = "1%";
    }
    confirmationRowDelete.textContent = text;
}

function confirmSaleEvent (text) {
    if (text === "") {
        confirmationSaleEvent.style.visibility = "hidden";
        confirmationSaleEvent.style.marginBottom   = "0";
        confirmationSaleEvent.style.marginTop = "0";
    } else {
        confirmationSaleEvent.style.visibility = "visible";
        confirmationSaleEvent.style.marginBottom  = "1%";
        confirmationSaleEvent.style.marginTop = "1%";
    }
    confirmationSaleEvent.textContent = text;
}

// find how much time until delivery date
function deliveryTimePromise() {
    const currentTime = Date.parse(new Date());

    // for each row, get the fate and parse it. Subtract delivery date 
    // from current date to see how much time is left 
    rows.forEach((row)=> {
        const timeTill = row.children[3];
        const deliveryDate = Date.parse(row.children[2].textContent);
    
        const timeDiff = (deliveryDate -currentTime) / 1000;

        // if time difference is NOT NAN, then see if there is
        // time left (positive time). If there is time left
        // then calculate the d, h, m, s until the delivery day,
        // and show that on the website.
        if (timeDiff) {
            if (timeDiff < 0) {
                timeTill.textContent = "PAST";
                
            } else {
                const d = Math.floor(timeDiff / 60 / 60 / 24);
                const h = Math.floor(timeDiff / 60 / 60) % 24;
                const m = Math.floor(timeDiff / 60) % 60;
                const s = Math.floor(timeDiff) % 60;

                // timeTill.textContent = timeDiff;
                timeTill.textContent = "   " + d+" days, "+h+" hours, "+m+" min, " +s+"sec";
            }
        }
    });
}


const sale = document.getElementById("sale");

const startSale = document.getElementById("sale-start");
const endSale = document.getElementById("sale-end");
var saleDescription;

// listen for a click on the button to set the sale
startSale.addEventListener("click", async () => {
    saleDescription = document.getElementById("sale-content").value

    const res = await fetch("/api/sale", {
        method : "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"message": saleDescription})
    });
    if (res.status === 200) {
        // if status is 200, then show this on the server, then delete the text after 4s
        confirmSaleEvent("Sale Started")
        setTimeout(confirmSaleEvent, 3000, "")
    }
});

// listen for a click on the button to end the sale
endSale.addEventListener("click", async () => {
    const res = await fetch("/api/sale", {
        method : "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"message": saleDescription})
    });
    if (res.status === 200) {
        // if status is 200, then show this on the server, then delete the text after 4s
        confirmSaleEvent("Sales Ended")
        setTimeout(confirmSaleEvent, 4000, "")
    }
})

deliveryTimePromise();
setInterval(deliveryTimePromise, 1000);