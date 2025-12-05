package com.example.sifen.domain.service;

import com.example.sifen.domain.model.Invoice;

public interface ElectronicBillingProvider {
    String processInvoice(Invoice invoice);
}
