var express = require('express')
var app = express();
var cors = require('cors')
var pool = require('./db')// pool object will be used for postgres queries..
var mcache = require('memory-cache');


// Caching to memcache...
var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}




//middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

//Routes//
app.get("/information/name/", async (req, res) => {
  try{
    const client_id = req.query["client_id"]
    const info = await pool.query("select client_personal.client_id,client_financial.gold_membership,client_personal.name, client_personal.age, client_personal.city, client_personal.gender from client_personal inner join client_financial on client_personal.client_id = client_financial.client_id WHERE client_personal.name ILIKE $1", [`${client_id}`]);
    res.json(info.rows)
  }
  catch (err) {
    console.error(err.message);
    res.json(err) 
  }
  
  });
  
app.get("/information/id/", async (req, res) => {
try{
  const client_id = req.query["client_id"]
  const info = await pool.query("select client_personal.client_id,client_financial.gold_membership,client_personal.name, client_personal.age, client_personal.city, client_personal.gender from client_personal inner join client_financial on client_personal.client_id = client_financial.client_id WHERE client_personal.client_id=$1", [`${client_id}`]);
  res.json(info.rows)
}
catch (err) {
  console.error(err.message);
  res.json(err) 
}

});
// // following are the loan eligibility criteria...
// Loan eligibility:
// • The client should be at least 25 years old, however, if the client is older than 21 and has
// a secondary education degree, she/he might be eligible too. Secondary education levels
// are represented by codes 1,2,3,4, and 8 in the CSV file; Values greater than 3 indicate a
// secondary education degree.
// • The client should not already have a house,
// • The client should be new to the province, she/he should not have lived here for more
// than 5 years.
// • Assume monthly repayments are 18% of their outstanding debt amount, and that
// charitable donations column is the total for the year.
// • Assume a base monthly living cost of Rupees 1100 per month for Maharashtra adjusted per
// city of residence (if known), as follows
// o Mumbai 96.95% of State level
// o Amravati 99.8% of State level
// o Pune 103.25% of State level
// o Nagpur 105.1% State level
// • If the client has met all the preceding criteria, she/he is eligible to receive a loan where
// monthly payments are not more than 40% of her/his monthly income. However, if the
// client has a golden membership with GetLoanApp this number can be up to 45% of
// her/his monthly income.











app.get("/",cache(60), async (req, res) => {
  try {
    //Client-id from the front-end for eligibility check...
    const client_id = req.query["client_id"]

    //Requesting database for the values... 
    const info = await pool.query("select client_financial.client_id,client_personal.city,client_personal.education,client_financial.income,client_financial.gold_membership,client_financial.charitable_donations, client_financial.house_value, client_personal.length_at_residence, client_personal.name,client_personal.age, client_financial.credit_card_debt from client_financial INNER JOIN client_personal on client_financial.client_id = client_personal.client_id where (client_financial.client_id = $1 )", [`${client_id}`]);

    console.log(info)
    // iniatlising with with database values...
    var age_of_client = info.rows[0].age
    var length_at_residence = info.rows[0].length_at_residence
    var is_a_gold_member = info.rows[0].gold_membership
    var does_own_a_house = info.rows[0].house_value
    var debt_to_pay = info.rows[0].credit_card_debt
    var is_a_degree_education = parseInt(info.rows[0].education)
    var charitable_donations = info.rows[0].charitable_donations
    var yearly_income = info.rows[0].income
    var city_of_residence = info.rows[0].city
    var name_of_client = info.rows[0].name

    //Monthly income, monthly card payment, monthly charitable donations
    monthly_income = parseInt((yearly_income / 12).toFixed(2))
    monthly_charitable_donation = parseInt((charitable_donations / 12).toFixed(2))
    debt_to_pay_monthly = parseInt((0.18 * debt_to_pay).toFixed(2))

    //
    var max_monthly_payment = 0;         // monthly income after the deductions 40/45% of the amount..
    var max_monthly_payment_possible = 0 // to check remaining amount after all deductions and then 40/45% of the monthly_income
    // condition 1st and 2nd
    var income_remaining = -1
    if ((age_of_client >= 25) || (age_of_client > 21 && is_a_degree_education > 3)) {

      if (length_at_residence < 6) {
        // Remaining income after paying the debts, doing charitable donations and monthly living expense andfrom the monthly income
        switch (city_of_residence) {
          //City wise expenses..
          //Mumbai 96.95% (Rs1100) = Rs 1066.45
          //Amravati 99.8% (Rs1100) = Rs 1097.8
          //Pune 103.25%(Rs1100) = Rs 1135.75
          //Nagpur 105.1%(Rs1100) = Rs 1156.1
          case 'Mumbai': income_remaining = (monthly_income - (debt_to_pay_monthly + monthly_charitable_donation + 1066.45));
            break;
          case 'Amravati': income_remaining = (monthly_income - (debt_to_pay_monthly + monthly_charitable_donation + 1097.80));
            console.log(income_remaining)
          break;
          case 'Pune': income_remaining = (monthly_income - (debt_to_pay_monthly + monthly_charitable_donation + 1135.75));
            break;
          default: income_remaining = (monthly_income - (debt_to_pay_monthly + monthly_charitable_donation + 1156.10))
        }

        //check for the gold members..
        if (is_a_gold_member == 1) {
          // max_monthly_payment_possible = (0.45 * income_remaining)
          max_monthly_payment = parseInt((0.45 * monthly_income).toFixed(2))
          if (max_monthly_payment > income_remaining) {

            // logic to return with max_monthly_payment_possible
            res.json({
              'Name': name_of_client,
              'Client_Id': client_id,
              'Eligibility_Status': 'Eligible',
              'Maximum_Monthly_Payments': 'Rs'+income_remaining
            })

          }
          else {
            // logic return with max_monthly_payment
            res.json({
              'Name': name_of_client,
              'Client_Id': client_id,
              'Eligibility_Status': 'Eligible',
              'Maximum_Monthly_Payments': 'Rs'+max_monthly_payment
               })
          }
        }
        // For non gold members..
        else {
          max_monthly_payment = parseInt((0.40 * monthly_income).toFixed(2))
          if (max_monthly_payment > income_remaining) {
            res.json({
              'Name': name_of_client,
              'Client_Id': client_id,
              'Eligibility_Status': 'Eligible',
              'Maximum_Monthly_Payments': 'Rs'+income_remaining
            })
            // logic to return with max_monthly_payment_possible
          }
          else {
            // logic return with max_monthly_payment
            res.json({
              'Name': name_of_client,
              'Client_Id': client_id,
              'Eligibility_Status': 'Eligible',
              'Maximum_Monthly_Payments': 'Rs'+max_monthly_payment,
            })
          }

        }

      } else {
        res.json({
          'Name': name_of_client,
          'Client_Id': client_id,
          'Eligibility_Status': 'Not Eligible',
          'Maximum_Monthly_Payments': 'N/A'
        })
      }
    }
    else {
      res.json({
        'Name': name_of_client,
        'Client_Id': client_id,
        'Eligibility_Status': 'Not Eligible',
        'Maximum_Monthly_Payments': 'N/A'
      })
    }

 

  } catch (err) {
    console.error(err.message);
  }
});



//Environment variable for the port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port} !`)
});