/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { PaymentInterface } from "@point_of_sale/app/payment/payment_interface";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { useService } from "@web/core/utils/hooks";
import { renderToString } from "@web/core/utils/render";
import { PosIntermoPopup } from "@pos_intermo/app/confirm_popup";

const REQUEST_TIMEOUT = 10000;

export class PaymentIntermo extends PaymentInterface {
    setup() {
        super.setup(...arguments);






//        this.pollingTimeout = null;
//        this.inactivityTimeout = null;
//        this.queued = false;
//        this.payment_stopped = false;
    }
//
    async send_payment_request(cid) {

        await super.send_payment_request(...arguments);
        var self = this;


        self.url_link =  await self._process_intermo(cid);
        self.intermoInterval = setInterval(async() => {
             await self._waitForPaymentConfirmation();
        }, 10000);
         self.IntermoPopup = await self.env.services.popup.add(PosIntermoPopup, {
                title: _t('Intermo Payment'),
                body: self.url_link.qr_code,
            });
         if (self.pos.get_order().intermo_payment_status == 'payment_pass'){
                  clearInterval(self.intermoInterval);
                  await self.pos.get_order().selected_paymentline.set_payment_status("done");
                  return true;

        }
        else{
              clearInterval(self.intermoInterval);
              await self.pos.get_order().selected_paymentline.set_payment_status("retry");
              return false;
        }






//        await this.env.services.action.doAction({
//        type: 'ir.actions.act_url',
//        url: url_link
//
//        })
    }
//
    pending_razorpay_line() {
        return this.pos.getPendingPaymentLine("intermo");
    }


    _call_intermo(data, action) {

        return this.env.services.orm.silent
            .call("pos.payment.method",
                action,
                [[this.payment_method.id], data]
            )
            .catch(this._handle_odoo_connection_failure.bind(this));
    }
//
    _handle_odoo_connection_failure(data = {}) {
        // handle timeout
        const line = this.pending_razorpay_line();
        if (line) {
            line.set_payment_status("retry");
        }
        this._showError(
            _t(
                "Could not connect to the Odoo server, please check your internet connection and try again."
            )
        );

        return Promise.reject(data); // prevent subsequent onFullFilled's from being called
    }


     async send_payment_cancel(order, cid) {
        console.log("=====================w-wwpwwwpewewp");
        await super.send_payment_cancel(...arguments);
        const paymentLine = this.pos.get_order()?.selected_paymentline;
        paymentLine.set_payment_status('retry');
        return true;
    }

    async _process_intermo(cid) {
        const order = this.pos.get_order();
        const line = order.paymentlines.find((paymentLine) => paymentLine.cid === cid);

        if (line.amount < 0) {
            this._showError(_t("Cannot process transactions with negative amount."));
            return Promise.resolve();
        }

        const orderId = order.name.replace(" ", "").replaceAll("-", "").toUpperCase();
        const referencePrefix = this.pos.config.name.replace(/\s/g, "").slice(0, 4);
        localStorage.setItem("referenceId", referencePrefix + "/" + orderId + "/" + crypto.randomUUID().replaceAll("-", ""));
        let baseUrl = window.location.origin+'/pos_intermo/notification';
        let updatedUrl = `${baseUrl}?order_id=${order.pos_session_id}`;

        var customername = "";
        var customeremail = "";
        if (order.partner) {
            customername = order.partner.name;
            customeremail = order.partner.email;
        }

        const data = {
            'amount': line.amount,
            "referenceid": order.name,
            "publicApiKey": this.payment_method.intermo_public_key,
            "sandbox": true,
            "currency": "XOF",
            "customername": customername,
            "customeremail": customeremail,
            "customerphone": "+",
            "callbackurl": updatedUrl,
            "notifyurl": 'https://webhook.site/ef69a887-d86b-4319-ad4c-a09be3653b6d',
            "pluginname": "prestashop",
            "pluginversion": "v1.1.0",
            "serverless": false,
            "pluginkey": this.payment_method.intermo_plugin_key,
            "secretkey": this.payment_method.intermo_secret_key,
            "isolang": "en"

        };
        console.log("================-----------", this.payment_method);
        console.log("================-----------", order.name);
        var self = this;
        var url_link = await self._call_intermo(data, 'intermo_make_payment_request');
        return url_link;

    }



    async _waitForPaymentConfirmation() {
        var self = this;
        const order = self.pos.get_order();

         const payment_trx = await self.pos.orm.call("pos.payment.txn", "search_read", [], {
            fields: ["name", "status"],
            domain: [["name", "=", order.name]]
        });
        if(payment_trx.length >0){

               order.intermo_payment_status =  payment_trx[0]['status'];
               console.log("=333232=3=323=23=3=2=32=2=2==22=2=2=2",order);
        }

    }
//

    _showError(error_msg, title) {
        this.env.services.dialog.add(AlertDialog, {
            title: title || _t("Intermo Error"),
            body: error_msg,
        });
    }
}
