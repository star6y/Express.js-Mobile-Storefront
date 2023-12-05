const express = require('express')
const app = express()
const port = 4131
const basicAuth = require('express-basic-auth')
app.use(express.urlencoded({ extended: true }));


app.set("views", "templates");
app.set("view engine", "pug");
app.use(express.json());
const data = require("./data")

let row_id = 3;
goodKeys = ['name', 'email', 'delivery_date', 'phone_model']; // removed "order",  'ID', , 'case'
phones = ["iPhone 15 Pro Max", "iPhone 15", "S23 Ultra", "S23+", "OnePlus 12 5G", "Pixel 8"];


// app.use(basicAuth( { authorizer: myAuthorizer } ))
// This ensures that the user is Authorized. Can be called for specific endpoints to
// protect them.
function Authorizer(username, password) {
	console.log(`\nuser : pass   ${username} : ${password} \n`)
	const userMatches = basicAuth.safeCompare(username, 'admin')
	const passwordMatches = basicAuth.safeCompare(password, 'password')
	
	// if false, we have an error handling middleware near the bottom to send a 403
	return userMatches & passwordMatches
} // code seen on https://npmjs.com/package/express-basic-auth


app.get("/", (req, res) => {
    res.render("mainpage.pug");
});
app.get("/main", (req, res) => {
    res.render("mainpage.pug");
});

app.get("/contact", (req, res) => {
    res.render("contactform.pug");
});


// This function is longer than the others... 
// We want to check that people have sent proper data, and all the needed data.
// There will be a few checks to ensure that the data recieved is true before
// certain code can be ran.
app.post("/contact", async (req, res) => {

	contactToPrint = JSON.stringify(req.body, null, 2)  // this is now a string
	contact = req.body  // this is now an object, so we can use key "in" object. 
	// Object can't be printed like string, need to do object.key
  	data_recieved = true;

	if (Object.keys(contact).length === 0) {
		data_recieved = false;
	} else {
		for (const key of goodKeys) {
			if (!(key in contact)) {
				data_recieved = false;
			}
		}
	}
	  
	if (data_recieved){
		contact.ID = row_id;
		row_id++;
		if (!contact['case']) {
			contact['case'] = "No";
		} else if (contact['case'] === 'on') {
			contact['case'] = "Yes";
		}
		if (!phones.includes(contact.phone_model)) {
			data_recieved = false;
		}
		if (typeof contact.name !== 'string' || contact.name.length === 0 || contact.name.length > 40) {
			data_recieved = false;
		}
	}
    
  // We will be checking the validity of the name, email, and date using regex.

  // how to do regex here (Regular expression)
  // https://www.freecodecamp.org/news/regex-for-date-formats-what-is-the-regular-expression-for-matching-dates/
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
  // https://www.w3schools.com/js/js_regexp.asp

  if (data_recieved) {
    const regexEmail = /^[a-zA-Z0-9._%+-]{1,40}@[a-zA-Z0-9.-]{1,20}\.(com|org|edu|gov|net)$/;
    // "^" start of line. [a-zA-Z ...] are the allowed chars. "+@" means the @ needs to be in the string
    // "\." we need a dot after the @____. Then we need a domain (might've missed many)
    // if we had "[a-zA-Z0-9._%+-]+@", the "+" means one or moreof the previous elements, but I want to require min 1, max 40 chars
    // A "$" at the end of the regex means thats the end of line, we don't check anything after, and there should 
    // not be anything after. Example without "$", a@a.com and a@a.comhello are both valid

    const regexDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD   ex 2019-01-09
    // YEAR- \d is for digit, the {4} we expect 4 of them. The "-" is the symbol we expect to separate the date
    // MONTH- (0[1-9]|1[0-2]) we expect 0 as first digit, then a digit ranged 0-9, or 1 as first digit, but limit next digit to 0, 1 or 2
    // DAY- Simiar as above. For the 3[01], first digit can be 3, but next is eiter 0 or 1 (instead of writing 0-1)

    const regexName = /^[a-zA-Z]+([ '-.][a-zA-Z]+)*$/;
    // we first need the name to start with a letter (Any number because of the "+").
    // Then we use "([ '-.][a-zA-Z]+)" to account for names like "Sr." or "La-a" or just a space between first and last name
    // "*" at the end means we can use this 0+ times
    

    if ((!regexEmail.test(contact.email)) || (!regexName.test(contact.name)) || 
                                                (!contact.delivery_date) || (!regexDate.test(contact.delivery_date))) {
      data_recieved = false;
    }
  }
  
  // now that we check the date validity, I want to make sure the year isn't too off
	var date; 
	if (data_recieved) {
    date = contact.delivery_date.split("-");
    const year = parseInt(date[0], 10);
    if (year < 2023 || year > 2030) {
    	data_recieved = false;
    }
}

console.log(`\nGood data: ${data_recieved}\nRequest Body: ${contactToPrint}\n`);
	if (data_recieved) {
	    await data.addContact(contact.name, contact.email, contact.delivery_date, contact.phone_model, contact.case)
    	res.status(201).render("postContactConfirmation.pug");
	} else {
    	res.status(400).render("postContactError.pug");
  	}
});


app.get("/testimonies", (req, res) => {
    res.render("testimonies.pug");
});

app.get("/admin/contactlog", basicAuth({ authorizer: Authorizer, challenge: true}), async (req, res) => {
  // we get all the contacts from the database
    let contacts = await data.getContacts();

    // mapping seems like less work than making a loop. Each contact object
    // needs to be in the correct form to match the pug template. If the data
    // in the mysql DB was null or similar, we'd just have the value be ""
    contacts = contacts.map(contact => {
        return {
            "ID": contact.id,
            "name": contact.name_ || "",
            "email": contact.email || "",
            "delivery_date": contact.delivery_date || "",
            "phone_model": contact.phone_model || "",
            "case": contact.case_ || ""
        };
    });
    res.render("contactlog.pug", {contacts});
});


app.use("/js", express.static("resources/js"))
app.use("/css", express.static("resources/css"))
app.use("/images", express.static("resources/images"))



app.get("/api/sale", async (req, res)=>{
    let recentSales = await data.getRecentSales();
    let saleTXT = ""

    for (let sale of recentSales) {
    // if the most recent sale is not NULL, break
        if (sale.end_sale === null) {
            saleTXT = sale.description_;
            break; 
        }
    }

    if (saleTXT === "") {
        res.json( {active:"false"})
    } else {
        res.json( {active:"false", message: saleTXT})
    }
})

// Show the 3 latest sales
app.get("/admin/salelog", basicAuth({ authorizer: Authorizer, challenge: true}), async (req, res)=>{
    let sales = await data.getRecentSales();

    let recentSales = sales.map(sale => {
        return {
            "message": sale.description_,
            "active": sale.end_sale === null ? 1 : 0
        };
    });
    res.json(recentSales);
})

app.post("/api/sale", basicAuth({ authorizer: Authorizer, challenge: true}), async (req, res)=>{
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({ "message": "not valid JSON" });
    }
    if (!req.body.message) {
        return res.status(400).json({"message":"no message provided"})
    } 
	await data.addSale(req.body.message); 
    res.status(200).json({"message":"sale activated"})
})

app.delete("/api/sale", basicAuth({ authorizer: Authorizer, challenge: true}), async (req, res)=>{
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({ "message": "not valid JSON" });
    } 
	await data.endSale(); 
    res.status(200).json({"message":"sale deleted"})
})

app.delete("/api/contact", basicAuth({ authorizer: Authorizer, challenge: true}), async (req, res)=>{
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({ "message": "no ID provided" });
    } 
    if (!req.body.id) {
        return res.status(400).json({ "message": "not valid JSON" });
    }

    let deleted = await data.deleteContact(req.body.id);

    if (deleted) {    // if contact was deleted
      return res.status(200).json({ "message": "ok" });
    }
    return res.status(404).json({ "message": "ID not in contacts" });
})

// Error Handling: Specifically for the basic authorization at the moment
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') { 
		res.status(403).json({ "message": "Forbidden access: better luck next time!" });
	} else {
    next(err); // let express handle the other errors
    }
});

//  If none of the other middleware were called
app.use((req, res) => {
    res.status(404).render("404.pug");
})

app.listen(port , () => {
    console.log(`Example app listening on port ${port}`)
})
