function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function sendLog() {
  var browser_id = getCookie("browser_id");
  if (browser_id == "") {
    browser_id = (Math.random()*1e64).toString(36);
    setCookie("browser_id", browser_id, 365);
  }
  log ["shop_id"] = shop_id;
  log ["browser_id"] = browser_id;
  log ["timestamp"] = Math.round(new Date().getTime()/1000)
  log ["url"] = window.location.href;
  var agent = {};
  var browser_version = navigator.appVersion;
  browser_version = browser_version.replace(';', ' ');
  agent["browser_version"] = browser_version;
  agent["cookie_enabled"] = navigator.cookieEnabled;
  agent["browser_language"] = navigator.language;
  agent["platform"] = navigator.platform;
  log ["user_agent"] = agent;

  if (log ["event"] != action[3]) {
    jQuery.ajax({
      method: 'GET',
      dataType: 'json',
      url: '/cart.js',
      success: function(data) {
        if (data.token != null) {
          var cart = {};
          cart ["item_count"] = data.item_count;

          var items = data.items;
          var products = [];
          
          for (var i = 0; i < items.length; i++)
          {
            products[i] = {};
            products[i]["product_id"] = items[i]["product_id"];
            products[i]["variant_id"] = items[i]["variant_id"];
            products[i]["quantity"] = items[i]["quantity"];
          }

          cart["items"] = products;
          cart ["total_price"] = data.total_price;
          cart ["total_weight"] = data.total_weight;
          log["cart"] = cart;

          var xhttp = new XMLHttpRequest();
          xhttp.open("POST", "https://shopify.mytools.io/demo", true);
          xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          var str = "json=";
          xhttp.send(str.concat(JSON.stringify(log)));
        }
      }
    });
  } else {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://shopify.mytools.io/demo", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var str = "json=";
    xhttp.send(str.concat(JSON.stringify(log)));
  }
}

var log = {};
var shop_id = 1;
var action = ["page_view", "product_view", "cart_view", "checkout_complete"];
log ["event"] = action[0];

function productView() {
  log ["event"] = action[1];
  var productHandle = window.location.pathname.match(/\/products\/([a-z0-9-]+)/)[1];
  jQuery.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/products/' + productHandle + '.js',
    success: function(data) {
      if (data.id != null) {
        log ["product_id"] = data.id.toString();
        sendLog();
      }
    }
  });
}

function cartView() {
  log ["event"] = action[2];
  sendLog();
}

function checkoutComplete() {
  log ["event"] = action[3];
  log ["order_id"] = Shopify.checkout.order_id;
  log ["customer_id"] = Shopify.checkout.customer_id;
  log ["customer_email"] = Shopify.checkout.email;
  log ["currency"] = Shopify.checkout.currency;

  var items = Shopify.checkout.line_items;
  var products = [];
  
  for (var i = 0; i < items.length; i++)
  {
    products[i] = {};
    products[i]["product_id"] = items[i]["product_id"];
    products[i]["variant_id"] = items[i]["variant_id"];
    products[i]["quantity"] = items[i]["quantity"];
  }
  log["items"] = products;
  sendLog();
}

function sendLogData() {
  if (window.location.pathname.indexOf('/products/') !== -1) {
      productView(); 
  }  
  else if (window.location.pathname.indexOf('/cart') !== -1) {
      cartView(); 
  }  
  else if (window.location.pathname.indexOf('/checkouts/') !== -1 
    && Shopify.Checkout.step == "thank_you") {
      checkoutComplete();
  }
  else {
    sendLog();
  }  
}

var jqPending = false;

function initJQuery() {
    if (typeof(jQuery) == 'undefined') {
        if (!jqPending) {
            jqPending = true;
            var s = document.createElement('script');
            s.src = '//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js';
            document.head.appendChild(s);
        }
        setTimeout(initJQuery, 50);
    } else {
        jQuery(function() {
            sendLogData();
        });
    }
}

initJQuery();
