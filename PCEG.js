if (!inIframe()) {

    // fix meta
    var meta = document.querySelector('meta[name=viewport]');
    if (meta) {
        if (!meta.content.includes('user-scalable=no')) {
            meta.content = meta.content + ',user-scalable=no';
        }
    } else {
        var meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        meta.content = "user-scalable=no";
        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    var checkoutFormMain = (document.querySelector('[action="/cart"]') ? document.querySelector('[action="/cart"]') : document.querySelector('[action="/cart/add"]'));
    if (!checkoutFormMain.action.includes('add')) {
        var checkoutButtonMain = checkoutFormMain.querySelector('[type="submit"]');
        checkoutFormMain.removeEventListener('submit', triggerPopup);
        checkoutFormMain.addEventListener('submit', triggerPopup);
    } else {

        var checkoutButtonMain = checkoutFormMain.querySelector('.shopify-payment-button__more-options');
        if (checkoutButtonMain) {

            var checkoutButtonMainCount = 1;

            function defercheckoutButtonMain(methodcheckoutButtonMain) {
                if (checkoutFormMain.querySelector('.shopify-payment-button__more-options') && !checkoutFormMain.querySelector('.shopify-payment-button__more-options').classList.contains('shopify-payment-button__button--hidden')) {
                    methodcheckoutButtonMain();
                } else {
                    if (checkoutButtonMainCount < 30) {
                        setTimeout(function() {
                            defercheckoutButtonMain(methodcheckoutButtonMain)
                        }, 300);
                        checkoutButtonMainCount++;
                    }
                }
            }
            defercheckoutButtonMain(function() {
                var checkoutButtonMain = checkoutFormMain.querySelector('.shopify-payment-button__more-options');
                checkoutButtonMain.removeEventListener('click', createIframe);
                checkoutButtonMain.addEventListener('click', createIframe);
              if(checkoutFormMain.querySelector('.shopify-payment-button__button--unbranded')) {
              var checkoutButtonMain2 = checkoutFormMain.querySelector('.shopify-payment-button__more-options');
                checkoutButtonMain2.removeEventListener('click', createIframe);
                checkoutButtonMain2.addEventListener('click', createIframe);
              }
            });

        }

    }
    // create Loader 
    if (!document.querySelector('.AACloader')) {
        var loader = document.createElement('div');
        loader.classList.add('AACloader');
        loader.style.cssText = 'display: none;z-index: 9999999;position: fixed;top: 50%;left: 50%;border-width: 0;margin-top: -50px; margin-left: -50px;';
        loader.innerHTML = '<svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve"><path fill="#000" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50" transform="rotate(10.616 50 50)"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform></path></svg>';
        loader.querySelector('svg').style.cssText = 'width: 100px;';
        document.body.appendChild(loader);
    }




    function changeCheckout() {
        AAC.removeEventListener('load', changeCheckout);
        // what page are we on?
        switch (AAC.contentWindow.document.querySelector('.breadcrumb .breadcrumb__item--current .breadcrumb__text').innerHTML) {
            case 'Information':
                // fill Then hide shipping
                fillThenHideShipping();
                break;
            case 'Shipping':
                // fill Then hide shipping
                redirectToInformation();
                break;
            default:
                launchCheckout();
                break;
        }
    }

    function triggerPopup(event) {
        event.preventDefault();
        createIframe();
    }


    function createIframe(event = null) {
        // create iframe
        window.AAC = document.createElement('iframe');
        AAC.style.cssText = "visibility:hidden; height:0px; width:0px;border: 0;"
        if (!event.target.closest('form').action.includes('add')) {
            AAC.removeEventListener('load', triggerCheckout);
            AAC.addEventListener('load', triggerCheckout);
            AAC.src = window.location.href;
        } else {
            AAC.removeEventListener('load', addressUpdate);
            AAC.addEventListener('load', addressUpdate);
            AAC.removeEventListener('load', changeCheckout);
            AAC.addEventListener('load', changeCheckout);
            AAC.removeEventListener('load', reloadParent);
            AAC.addEventListener('load', reloadParent);
            AAC.src = getCheckoutURL();
        }
        document.body.appendChild(AAC);
        showLoader();
    }

    function triggerCheckout() {
        AAC.removeEventListener('load', triggerCheckout);

        AAC.removeEventListener('load', addressUpdate);
        AAC.addEventListener('load', addressUpdate);

        AAC.removeEventListener('load', changeCheckout);
        AAC.addEventListener('load', changeCheckout);

        // killswitch
        AAC.removeEventListener('load', reloadParent);
        AAC.addEventListener('load', reloadParent);
        AAC.contentWindow.document.querySelector('[action="/cart"] [type="submit"]').click();

    }




    // helper functions
    function addressUpdate() {
        hideLoader();
        var url = AAC.contentWindow.location.href;
        var title = AAC.contentWindow.document.title;
        history.pushState('', title, url);
        document.title = title;
    }

    function launchCheckout() {
        AAC.style.cssText = "position: fixed;width: 100%;height: 100%;top: 0px;z-index: 2147483647; background:#fff;border: none;";
        document.body.style.cssText = 'position: fixed;width:0;height:0;';
    }


    function getCheckoutURL() {
        if (checkoutFormMain.querySelector(".multiselect_wrap")) {
            var itemStr = '';
            var i = 0;
            var matches = Array.from(checkoutFormMain.querySelectorAll('[name="id"]:checked'));
            var $len = matches.length;
            matches.forEach(function(element) {
                itemStr += element.value + ':' + element.getAttribute('quantity');
                if (i !== $len - 1) {
                    itemStr += ',';
                }
                i++;
            });
        } else {
            itemStr = checkoutFormMain.querySelector('[name="id"]').value;
            itemStr += ':' + (checkoutFormMain.querySelector('[name="quantity"]') ? checkoutFormMain.querySelector('[name="quantity"]').value : 1);
        }
        console.log(window);
        return 'https://' + window.document.location.host + '/cart/' + itemStr + '?checkout';

    }



    // changeCheckout Library
    function fillThenHideShipping() {
        var shippingSection = AAC.contentWindow.document.querySelector('.section--shipping-address');
        shippingSection.style.cssText = 'visibility: hidden;height: 0px;width: 0px;padding: 0; position:fixed;';
        // set required fields
        shippingSection.querySelector('#checkout_shipping_address_last_name').value = 'Unavailable';
        shippingSection.querySelector('#checkout_shipping_address_address1').value = 'Unavailable';
        shippingSection.querySelector('#checkout_shipping_address_city').value = 'Unavailable';
        shippingSection.querySelector('#checkout_shipping_address_province').value = 'GA';
        shippingSection.querySelector('#checkout_shipping_address_zip').value = '30363';
        // change button
        AAC.contentWindow.document.querySelector('#continue_button span').innerHTML = 'Continue';
        // setup form redirect
        var contactForm = shippingSection.closest('form');
        contactForm.removeEventListener('submit', refreshContactForm);
        contactForm.addEventListener('submit', refreshContactForm);
        launchCheckout();


    }

    function refreshContactForm(event) {
        event.preventDefault();
        this.querySelector('#checkout_shipping_address_last_name').value = this.querySelector('#checkout_email').value;
        var formData = serialize(this);
        // validate email 
        if (validateEmail()) {
            createAAC(formData);
        } else {
            AAC.removeEventListener('load', showError);
            AAC.addEventListener('load', showError);
            AAC.contentWindow.location.href = 'https://' + AAC.contentWindow.location.host + AAC.contentWindow.location.pathname + '?step=contact_information';
        }


    }

    function redirectToInformation() {
        // if we dont have a name redirect
        var address = AAC.contentWindow.document.querySelector('.address--tight');
        if (address.innerText.includes('Unavailable')) {
            AAC.removeEventListener('load', waitForRedirect);
            AAC.addEventListener('load', waitForRedirect);
            AAC.contentWindow.location.href = 'https://' + AAC.contentWindow.location.host + AAC.contentWindow.location.pathname + '?step=contact_information';
        } else {
            launchCheckout();
        }
    }

    function waitForRedirect() {
        AAC.removeEventListener('load', waitForRedirect);
        clearCheckout();
        launchCheckout();
    }

    function reloadParent() {
        if (!AAC.contentWindow.location.pathname.includes('checkouts')) {
            AAC.removeEventListener('load', reloadParent);
            window.location.href = AAC.contentWindow.location;
        }
    }

    function clearCheckout() {
        var shippingSection = AAC.contentWindow.document.querySelector('.section--shipping-address');
        // clear required fields
        shippingSection.querySelector('#checkout_shipping_address_last_name').value = '';
        shippingSection.querySelector('#checkout_shipping_address_address1').value = '';
        shippingSection.querySelector('#checkout_shipping_address_city').value = '';
        shippingSection.querySelector('#checkout_shipping_address_province').value = 'GA';
        shippingSection.querySelector('#checkout_shipping_address_zip').value = '';

        var contactSection = AAC.contentWindow.document.querySelector('.section--contact-information');
        contactSection.style.cssText = 'visibility: hidden;height: 0px;width: 0px;padding: 0; position:fixed;';
        shippingSection.style.cssText = 'padding:0;';
    }


    function validateEmail() {
        var emailFieldValue = AAC.contentWindow.document.querySelector('#checkout_email').value;
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailFieldValue)) {
            return (true)
        }
        return (false)
    }



    function showError() {

        fillThenHideShipping();
        var emailFieldWrap = AAC.contentWindow.document.querySelector('#checkout_email').closest('.field__input-wrapper');
        emailFieldWrap.classList.add('field--error');
        var errormsg = document.createElement('p');
        errormsg.classList.add('field__message', 'field__message--error');
        errormsg.id = "error-for-email";
        errormsg.innerHTML = 'Enter a valid email';
        emailFieldWrap.appendChild(errormsg);

    }

    function createAAC(data) {
        console.log('Sending data');

        const XHR = new XMLHttpRequest();


        // Define what happens on successful data submission
        XHR.addEventListener('load', function(event) {
            AAC.removeEventListener('load', clearCheckout);
            AAC.addEventListener('load', clearCheckout);
            AAC.contentWindow.location.href = 'https://' + AAC.contentWindow.location.host + AAC.contentWindow.location.pathname + '?step=contact_information';
        });

        // Define what happens in case of error
        XHR.addEventListener('error', function(event) {
            alert('You typed your email wrong');
        });

        // Set up our request
        XHR.open('POST', 'https://' + AAC.contentWindow.location.host + AAC.contentWindow.location.pathname);

        // Add the required HTTP header for form data POST requests
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Finally, send our data.
        XHR.send(data);
    }




    // loader functions
    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

} // end If Not Iframe  




function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

/*!
 * Serialize all form data into a query string
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}   form The form to serialize
 * @return {String}      The serialized form data
 */
var serialize = function(form) {

    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < form.elements.length; i++) {

        var field = form.elements[i];

        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
            for (var n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[n].value));
            }
        }

        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
        }
    }

    return serialized.join('&');

};
