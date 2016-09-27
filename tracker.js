function sendLog() {
  new Fingerprint2().get(function(result) {
    log ["shopID"] = shopID;
    log ["browserID"] = result;
    log ["timestamp"] = Math.round(new Date().getTime()/1000)
    log ["url"] = window.location.href;
    var agent = {};
    var browserVersion = navigator.appVersion;
    browserVersion = browserVersion.replace(';', ' ');
    agent["browserVersion"] = browserVersion;
    agent["cookieEnabled"] = navigator.cookieEnabled;
    agent["browserLanguage"] = navigator.language;
    agent["platform"] = navigator.platform;
    log ["userAgent"] = agent;

    var cartObj = {};
    cartObj ["itemCount"] = cart.item_count;

    var items = cart.items;
    var products = [];
    
    for (var i = 0; i < items.length; i++)
    {
      products[i] = {};
      products[i]["productID"] = items[i]["product_id"];
      products[i]["variantID"] = items[i]["variant_id"];
      products[i]["quantity"] = items[i]["quantity"];
    }

    cartObj["products"] = products;
    cartObj ["totalPrice"] = cart.total_price;
    cartObj ["totalWeight"] = cart.total_weight;
    log["cart"] = cartObj;

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://shopify.mytools.io/demo", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var str = "json=";
    xhttp.send(str.concat(JSON.stringify(log)));
  });
}

var log = {};
var shopID = 1;
var action = ["page viewed", "product searched", "collection viewed", "product viewed", "cart viewed", 
  "start checkout", "complete checkout"];
log ["action"] = action[0];

function productSearched() {
  log ["action"] = action[1];
  log ["searchTerms"] = search.terms;
  log ["resultCount"] = search.results_count;    

  var results = [];
  var items = search.results;
  for (var i = 0; i < items.length; i++)
  {
    results[i] = {};
    results[i]["id"] = items[i]["id"];
  }
  log["results"] = results;
}

function collectionViewed() {
  log ["action"] = action[2];
  log ["collectionID"] = collection.id;
}

function productViewed() {
  log ["action"] = action[3];
  log ["productID"] = product.id;
}

function cartViewed() {
  log ["action"] = action[4];
}

function checkoutStepStarted() {
  log ["action"] = action[5];
}

function checkoutStepCompleted() {
  log ["action"] = action[6];
  log["id"] = checkout.id;
  log["email"] = checkout.email;
  log["buyerAcceptsMarketing"] = checkout.buyer_accepts_marketing;
  log["billingAddress"] = checkout.billing_address;

  var items = checkout.line_items;
  var products = [];
  
  for (var i = 0; i < items.length; i++)
  {
    products[i] = {};
    products[i]["productID"] = items[i]["product_id"];
    products[i]["variantID"] = items[i]["variant_id"];
    products[i]["quantity"] = items[i]["quantity"];
  }
  log["items"] = products;
}

if (window.location.pathname.indexOf('/search') !== -1) {
    productSearched(); 
} 
else if (window.location.pathname.indexOf('/collections/') !== -1 && 
  window.location.pathname.indexOf('/products/') == -1) {
  	collectionViewed(); 
} 
else if (window.location.pathname.indexOf('/products/') !== -1) {
    productViewed(); 
}  
else if (window.location.pathname.indexOf('/cart') !== -1) {
    cartViewed(); 
}  
else if (window.location.pathname.indexOf('/checkouts/') !== -1 
  && window.location.pathname.indexOf('/thank_you') == -1
  && window.location.pathname.indexOf('step') == -1) {
    checkoutStepStarted(); 
}
else if (window.location.pathname.indexOf('/checkouts/') !== -1 
  && window.location.pathname.indexOf('/thank_you') !== -1) {
    checkoutStepCompleted();
}

sendLog();

