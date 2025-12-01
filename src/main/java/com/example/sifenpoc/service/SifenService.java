package com.example.sifenpoc.service;

import com.example.sifenpoc.dto.FacturaDTO;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class SifenService {

    private static final String CERT_PATH = "user-certificate.pfx"; // Example path

    public String procesarFactura(FacturaDTO facturaDTO) {
        File certFile = new File(CERT_PATH);

        if (!certFile.exists()) {
            return generarXmlSimulado(facturaDTO);
        }

        // Real logic would go here
        return "Certificado encontrado. Intentando firmar (No implementado en POC)";
    }

    private String generarXmlSimulado(FacturaDTO dto) {
        // In a real scenario, we would use the library objects here.
        // For this POC simulation without the library's full context/javadocs available,
        // we construct a basic XML representing the invoice.
        
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <rDE xmlns="http://ekuatia.set.gov.py/sifen/xsd">
                    <dVerFor>150</dVerFor>
                    <DE>
                        <dDVId>
                            <dCodKon>olazax</dCodKon>
                        </dDVId>
                        <gDatGralOpe>
                            <dFeEmiDE>2023-10-27T10:00:00</dFeEmiDE>
                            <gOpeCom>
                                <iTipTra>1</iTipTra>
                                <dNomCli>%s</dNomCli>
                                <dRucRec>%s</dRucRec>
                            </gOpeCom>
                        </gDatGralOpe>
                        <gTotSub>
                            <dTotOpe>%s</dTotOpe>
                        </gTotSub>
                    </DE>
                </rDE>
                """.formatted(dto.getCliente(), dto.getRuc(), dto.getMonto());
    }
}
