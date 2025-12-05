package com.example.sifen.infrastructure.external;

import com.example.sifen.domain.model.Invoice;
import com.example.sifen.domain.service.ElectronicBillingProvider;
import org.springframework.stereotype.Component;

@Component
public class SifenProviderAdapter implements ElectronicBillingProvider {

    @Override
    public String processInvoice(Invoice invoice) {
        // Here we would adapt the Domain Invoice to the SIFEN library's format
        // and call the actual SIFEN service.
        // For now, we return a simulation string.

        return "SIMULATION: Invoice " + invoice.getStampNumber() + " processed for client " + invoice.getClientName();
    }
}
