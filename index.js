const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors");
const config = require( 'config'); 
const stripe = require("stripe")(process?.env?.stripeSecretKeyLive ||  config.get('stripeSecretKeyTest'));
// const cheerio = require('cheerio');
const axios = require('axios');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// async function scrapeWebsite(url) {
// 	try {
// 	  const response = await axios.get(url);
// 	  const $ = cheerio.load(response.data);
//    console.log($)
// 	// Example: Scraping all <a> tags and printing their text and href attributes
// 	//   $('a').each((index, element) => {
// 	// 	const text = $(element).text();
// 	// 	const href = $(element).attr('href');
// 	// 	console.log(`${text}: ${href}`);
// 	//   });
    
// 	//   // Example: Scraping all <link> tags with rel="stylesheet" and printing their href attributes
// 	//   $('link[rel="stylesheet"]').each((index, element) => {
// 	// 	const href = $(element).attr('href');
// 	// 	console.log(`CSS File: ${href}`);
// 	//   });
    
// 	// Add more scraping logic here as needed
    
// 	} catch (error) {
// 	  console.error('Error scraping website:', error);
// 	}
//   }
  
  // Replace 'https://example.com' with the URL of the website you want to scrape
  //   const websiteUrl = 'https://brasero-france.com/pages/conditions-generales-de-vente';
  //   scrapeWebsite(websiteUrl);

  app.post('/scrape', async (req, res) => {
	try {
	  let { url,formValues } = req.body;
	  url = `https://brasero-france.com${url}`;
	  console.log(req.body,'body')
	  if(req.body.url === '/cart/add') {
		const reqData = {
			method: 'post',
			url,
			// headers: {}, 
			data: {
				...formValues, // This is the body part https://brasero-france.com
			}
		  };
		 
		const response = await axios(reqData);
		res.send(response.data);
	  }else{
		const response = await axios.get(url);
		res.send(response.data);
	  }
	} catch (error) {
	  res.status(500).send('Error fetching data from brasero-france.com');
	}
  });

  app.post('/create-charge', async (req, res) => {
	try {
		const {number,exp_month,exp_year,cvc,amount} = req?.body || {number:false,exp_month:false,exp_year:false,csv:false,amount:0}
		const card = {
		  number,
		  exp_month:parseInt(exp_month, 10),
		  exp_year:exp_year * 1,
		  cvc,
		};
		const token = await stripe.tokens.create({card});
		// const charge =
		await stripe.charges.create({
			amount:amount*100,
			currency: 'EUR',
			source: token.id,
			description: 'Product purchase #token.id',
		});
		//const reqCall = new Purchase({...req.body,charge,token,card});
		//await reqCall.save();

		// const mailOptions = {
		// 	from: 'haykhuna@gmail.com',
		// 	to: 'haykhuna@gmail.com',
		// 	subject: `You have new tranzaction.`,
		// 	text: `You have a new pay ( ${amount} $ ).`
		// };
		//await SENDEMAIL(mailOptions);
		return res.status(200).json({data:'Your payment is successfull'})
	} catch (error) {
	  res.status(500).send('Error fetching data from brasero-france.com');
	}
  });

  app.post('/payment', async (req, res) => {
	let { amount, id } = req.body
	try {
		console.log(amount,'amount');
		console.log(amount*100,'amount');
		// payment =
	    await stripe.paymentIntents.create({
			amount:amount*100,
			currency: "EUR",
			description: `Product Purchase #${id}`,
			// payment_method: id,
			// confirm: true,
			automatic_payment_methods: {
				enabled: true,
			},
		})
		// const reqCall = new Purchase({...req.body,card:payment,verified:false});
		// await reqCall.save();
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false,
			dataMessageValue:error
		})
	}
  })

app.listen(process.env.PORT || 4000, () => {
	console.log("Sever is listening on port 4000")
})
