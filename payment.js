const paypal = require('paypal-rest-sdk');

// Configure PayPal SDK with your client ID and secret
paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET'
});

module.exports = function (app, mysql) {
  // Endpoint to handle payment
  app.get('/app_payment', (req, res) => {
    // Fetch admission number from the query parameter
    const admissionNumber = req.query.admissionNumber;

    // Fetch additional details needed for payment (e.g., amount to pay)
    // You can customize this based on your requirements
    const amount = 500; // Example: Set a fixed amount for demonstration

    // Create PayPal payment request
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: 'http://localhost:3000/payment_success', // Endpoint to handle successful payment
        cancel_url: 'http://localhost:3000/payment_cancel' // Endpoint to handle canceled payment
      },
      transactions: [{
        item_list: {
          items: [{
            name: 'Application Fee',
            sku: 'application_fee',
            price: amount,
            currency: 'NGN', // Set currency to Nigerian Naira
            quantity: 1
          }]
        },
        amount: {
          currency: 'NGN', // Set currency to Nigerian Naira
          total: amount
        },
        description: 'Application fee payment'
      }]
    };

    // Create PayPal order
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).send('Failed to create PayPal order');
      } else {
        // Redirect the user to PayPal's payment page
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  });

  // Endpoint to handle successful payment
  app.get('/payment_success', (req, res) => {
    // Handle successful payment (e.g., update payment status in the database)
    res.send('Payment successful');
  });

  // Endpoint to handle canceled payment
  app.get('/payment_cancel', (req, res) => {
    // Handle canceled payment (e.g., redirect user to payment page again)
    res.send('Payment canceled');
  });
};
