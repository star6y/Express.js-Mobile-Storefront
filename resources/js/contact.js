// elements we are looking for
const phoneModel = document.getElementById("phone_model");
const phoneCase = document.getElementById("case");
// variables to hold the phone and case cost
var phoneCost = 0;
var caseCost = 0;
// the "pay" will be the text shown if the cost is above $0.00
const pay = document.getElementById("pay");

// we check if any change happened from the "select" input
// if som then we take the phone model and apply the price
phoneModel.addEventListener("change", (model)=> {
    if (model.target.value === "iPhone 15 Pro Max") {
       phoneCost = 1299;
    } else if (model.target.value === "iPhone 15") {
       phoneCost = 799;
    } else if (model.target.value === "S23 Ultra") {
       phoneCost = 1199;
    } else if (model.target.value === "S23+") {
       phoneCost = 999;
    } else if (model.target.value === "OnePlus 12 5G" ) {
       phoneCost = 849;
    } else if (model.target.value === "Pixel 8" ) {
       phoneCost = 699;
    } else {
       phoneCost = 0;
    }

    // if user didn't seelct any phone then we show no text
    if (phoneCost > 0) {
        pay.textContent = "Cost: $" + (phoneCost + caseCost);
    } else {
        pay.textContent = "";
    }
})

// if the user clicks on the case checkbox, then we add the case cost
// to the overall cost. If the user unchecks the box, we must subtract
// the case cost and update the site
phoneCase.addEventListener("change", () => {
    if (phoneCase.checked) {
        caseCost = caseCost + 21;
        pay.textContent = "Cost: $" + (phoneCost + caseCost);
    } else if (phoneCost > 0) {
        caseCost = caseCost - 21;
        pay.textContent = "Cost: $" + (phoneCost + caseCost);
    } else {
        caseCost = caseCost - 21;
        pay.textContent = "";
    }
})

// example seen on 
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
