export const DOCTOR_INFO = {
    nombre: "Dr. Walter J. Florez Guerra",
    especialidad: "Médico Cirujano - Otorrinolaringólogo",
    credenciales: "CMP 64028 - RNE 34394",
    contacto: "wflorez16@gmail.com - 955449503"
};

export const VADEMECUM_TABULAR = {
    "OÍDO": [
        { name: "Ciriax Otic", med: "Ciprofloxacino 0,2% + Hidrocortisona 1% (Ciriax otic)", cant: "1 Got", ind: "3 gotas c/8h (en oido   ) 5 minutos y luego dejar que salga", via: "TOP", dur: "10 dias" },
        { name: "Ac. Acético", med: "Ac. Acetico 2% + Alcohol isopropilico 70º CSP 30 ml", cant: "1 Got", ind: "3 gotas c/8h (en oido   ) 5 minutos y luego dejar que salga", via: "TOP", dur: "10 días" },
        { name: "Zaldiar", med: "Tramadol/Paracetamol (Zaldiar)", cant: "9 Tab", ind: "1 tableta c/8 h D - A - C (primeros dias, condicional a dolor intenso)", via: "VO", dur: "3 dias" },
        { name: "Paracetamol 500", med: "Paracetamol 500 mg", cant: "9 Tab", ind: "1 tableta c/8 h D - A - C (condicional a dolor moderado)", via: "VO", dur: "3 dias" },
        { name: "Otozambon", med: "Otozambon", cant: "1 Got", ind: "3 gotas c/8h (en oidos) 5 minutos y luego retirar", via: "TOP", dur: "7 dias" },
        { name: "Aceite Almendras", med: "Aceite de almendra o de bebe o glicerina", cant: "1 Fco", ind: "3 gotas c/24 h en ambos oidos", via: "TOP", dur: "30 dias" },
        { name: "Prednisona 50", med: "Prednisona 50 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
        { name: "Prednisona 20", med: "Prednisona 20 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
        { name: "Prednisona 5 (10)", med: "Prednisona 5 mg", cant: "10 Tab", ind: "2 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
        { name: "Prednisona 5 (5)", med: "Prednisona 5 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
        { name: "Lipoflavonoides", med: "Lipoflavonoides (Ringing Ears)", cant: "1 Fco", ind: "1 tab c/24h", via: "VO", dur: "30 dias" },
        { name: "Betahistina 16", med: "Betahistina (Microser) 16 mg", cant: "14 Tab", ind: "16 mg (1 tableta) c/12h", via: "VO", dur: "7 dias" },
        { name: "Acetazolamida", med: "Acetazolamida 250 mg", cant: "10 Tab", ind: "1 tableta c/24h 8 am (consumir con un platano diario)", via: "VO", dur: "10 dias" },
        { name: "Dimenhidrinato", med: "Dimenhidrinato (gravol)", cant: "10 Tab", ind: "1 tableta condiciona a nauseas y vomitos", via: "VO", dur: "10 dias" },
        { name: "Amox/Clav 500", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "14 dias" },
        { name: "Amoxicilina 500", med: "Amoxicilina 500 mg", cant: "21 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "7 dias" },
        { name: "Amox/Clav 875", med: "Amoxicilina/Ac. Clavunico 875 mg (Amoxidal plus)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
        { name: "Amox/Clav Jbe", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" }
    ],
    "NARIZ": [
        { name: "Neilmed", med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
        { name: "Ryaltris", med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
        { name: "Rupatadina", med: "Rupatadina 10 mg (Rupatadina)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
        { name: "Deflazacort 30", med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
        { name: "Breath Right", med: "Respira Mejor (Breath Right)", cant: "30 Tiras", ind: "Colocar sobre dorso nasal (cada noche o durante ejercicio)", via: "TOP", dur: "30 dias" },
        { name: "Hisaler D", med: "Cetirizina + Pseudoefedrina (Hisaler D)", cant: "7 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "7 dias" },
        { name: "Afrin", med: "Oximetazolina (AFRIN SP 0.05 %)", cant: "1 Sol", ind: "1 - 2 gotas c/24h en cada fosa nasal o fosa nasal mas obstruida", via: "TOP", dur: "SOLO 3 dias!" },
        { name: "Montelukast", med: "Montelukast 10 mg", cant: "30 Tab", ind: "1 tableta c/24h (17:00 h) (alejado de los alimentos por 2 horas)", via: "VO", dur: "30 dias" },
        { name: "Rinomar Hiper", med: "Cloruro de Sodio (Rinomar Hipertonico)", cant: "1 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
        { name: "Ryaltris (2)", med: "Mometasona + Olopatadina (Ryaltris)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Nasonex", med: "Mometasona (Nasonex) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Fluimicil", med: "Acetilcisteina (fluimicil) 200 mg", cant: "10 Sob", ind: "1 sobre en un vaso con agua c/12h", via: "VO", dur: "5 dias" },
        { name: "Probiocyan", med: "Lactobacillus plantarum (Probiocyan)", cant: "30 Tab", ind: "1 cap c/24h por 30 dias", via: "VO", dur: "30 dias" },
        { name: "Rinosal B", med: "Budesonida (Rinosal B, Corbuton)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
        { name: "Anginovag", med: "Anginovag (spray bucal)", cant: "1 Fco", ind: "2 puff c/8 h en boca", via: "TOP", dur: "5 dias" },
        { name: "Cloruro Sodio 1L", med: "Cloruro de sodio 0.9% 1 L", cant: "5 Fco", ind: "19.9 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Shampoo J&J", med: "Shampoo J&J", cant: "1 Fco", ind: "0.1 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Jeringa 20", med: "Jeringa 20 ml", cant: "15 Unidad", ind: "20 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Rinosal B Spray", med: "Budesonida (Rinosal B, corbuton) SPRAY NASAL", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
        { name: "Libbera", med: "Levocetirizina (Libbera)", cant: "5 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "5 dias" },
        { name: "Deflazacort 30 (2)", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h con el desayuno!", via: "VO", dur: "5 dias" },
        { name: "Omeprazol", med: "Omeprazol 20 mg", cant: "30 Tab", ind: "1 tableta c/24h 30 minutos antes del desayuno", via: "VO", dur: "30 dias" },
        { name: "Claritromicina", med: "Claritromicina 500 mg", cant: "30 Tab", ind: "250 mg (1/2 tableta) c/24 h 8 am", via: "VO", dur: "30 dias" },
        { name: "Amox/Clav 500 (2)", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A.- C)", via: "VO", dur: "14 dias" },
        { name: "Amox/Clav 875 (2)", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
        { name: "Amox/Clav Jbe (2)", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" },
        { name: "Levofloxacino 750 (3)", med: "Levofloxacino 750 mg (Ponaris)", cant: "3 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "3 dias" },
        { name: "Levofloxacino 500 (7)", med: "Levofloxacino 500 mg (Ponaris)", cant: "7 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "7 dias" },
        { name: "Levofloxacino 750 (2)", med: "Levofloxacino 750 mg (Ponaris)", cant: "2 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "2 dias" },
        { name: "Levofloxacino 500 (8)", med: "Levofloxacino 500 mg (Ponaris)", cant: "8 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "8 dias" }
    ],
    "LARINGE": [
        { name: "Rinomar", med: "Cloruro de Sodio 0.9% (Rinomar)", cant: "2 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
        { name: "Ryaltris", med: "Mometasona + Olopatadina (Ryaltris)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Hisaler D", med: "Cetirizina + Pseudoefedrina (Hisaler D)", cant: "7 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "7 dias" },
        { name: "Deflazacort 30", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am!!) (con el desayuno!)", via: "VO", dur: "5 dias" },
        { name: "Breath Right", med: "Respira Mejor (Breath Right)", cant: "30 Tiras", ind: "Colocar sobre dorso nasal (cada noche o durante ejercicio)", via: "TOP", dur: "30 dias" },
        { name: "Afrin", med: "Oximetazolina (AFRIN SP 0.05 %)", cant: "1 Sol", ind: "1 - 2 gotas c/24h en cada fosa nasal o fosa nasal mas obstruida", via: "TOP", dur: "SOLO 3 dias!" },
        { name: "Montelukast", med: "Montelukast 10 mg", cant: "30 Tab", ind: "1 tableta c/24h (17:00 h) (alejado de los alimentos por 2 horas)", via: "VO", dur: "30 dias" },
        { name: "Rinomar (2)", med: "Cloruro de Sodio 0.9% (Rinomar)", cant: "1 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
        { name: "Flucomixx", med: "Fluticasona (Flucomixx) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Nasonex", med: "Mometasona (Nasonex) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Allegra 180", med: "Fexofenadina (Allegra) 180 mg", cant: "5 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "5 dias" },
        { name: "Deflazacort 30 (2)", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
        { name: "Fluimicil", med: "Acetilcisteina (fluimicil) 200 mg", cant: "10 Sob", ind: "1 sobre en un vaso con agua c/12h", via: "VO", dur: "5 dias" },
        { name: "Rinosal B", med: "Budesonida (Rinosal B, Corbuton)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
        { name: "Anginovag", med: "Anginovag (spray bucal)", cant: "1 Fco", ind: "2 puff c/8 h en boca", via: "TOP", dur: "5 dias" },
        { name: "Cloruro Sodio 1L", med: "Cloruro de sodio 0.9% 1 L", cant: "5 Fco", ind: "20 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Jeringa 20", med: "Jeringa 20 ml", cant: "15 Unidad", ind: "20 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Rinosal B Spray", med: "Budesonida (Rinosal B, corbuton) SPRAY NASAL", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
        { name: "Libbera", med: "Levocetirizina (Libbera)", cant: "5 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "5 dias" },
        { name: "Deflazacort 30 (3)", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h con el desayuno!", via: "VO", dur: "5 dias" },
        { name: "Esomeprazol 40", med: "Esomeprazol 40 mg", cant: "30 Tab", ind: "1 tableta c/24h 30 minutos antes del desayuno", via: "VO", dur: "30 dias" },
        { name: "Claritromicina", med: "Claritromicina 500 mg", cant: "30 Tab", ind: "250 mg (1/2 tableta) c/24 h 8 am", via: "VO", dur: "30 dias" },
        { name: "Amox/Clav 500", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A.- C)", via: "VO", dur: "14 dias" },
        { name: "Amox/Clav 500 (2)", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "14 dias" },
        { name: "Amoxicilina 500", med: "Amoxicilina 500 mg", cant: "21 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "7 dias" },
        { name: "Amox/Clav 875", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
        { name: "Amox/Clav Jbe", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" },
        { name: "Amitriptilina", med: "Amitriptilina 25 mg", cant: "30 Tab", ind: "1 tab c/24h 8 pm", via: "VO", dur: "30 dias" }
    ],
    "NIÑOS": [
        { name: "Neilmed", med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
        { name: "Nasonex", med: "Mometasona (Nasonex)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
        { name: "Loratadina Jbe", med: "Loratadina 5mg/5ml", cant: "1 Jbe", ind: "    ml c/24h 8 pm o condicional a rinorrea", via: "VO", dur: "7 dias" },
        { name: "Hisaler Jbe", med: "Hisaler 5mg/5ml", cant: "1 Jbe", ind: "    ml c/24h 8 pm o condicional a rinorrea", via: "VO", dur: "7 dias" },
        { name: "Amoxicilina Jbe", med: "Amoxicilina 250 mg/5 ml", cant: "1 Jbe", ind: "    ml c/8h D - A - C", via: "VO", dur: "5 dias" },
        { name: "Panadol Jbe", med: "Paracetamol (Panadol) 160 mg/5 ml", cant: "1 Jbe", ind: "    ml c/8h D - A - C Condicional a dolor o fiebre", via: "VO", dur: "5 dias" },
        { name: "Amox/Clav Jbe", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" },
        { name: "Argirol", med: "Argirol 2%", cant: "1 Fco", ind: "2 gotas c/12h en cada fosa nasal", via: "TOP", dur: "5 dias" },
        { name: "Rinomar", med: "Cloruro de Sodio 0.9% (Rinomar)", cant: "1 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
        { name: "Hisaler Tab", med: "Hisaler", cant: "7 Tab", ind: "1 tab c/24 8 pm", via: "VO", dur: "7 dias" },
        { name: "Tetraciclina", med: "Tetraciclina (tetralan)", cant: "1 Ung", ind: "aplic en nariz c/12h", via: "TOP", dur: "7 dias" },
        { name: "Salbutamol 6h", med: "SALBUTAMOL 100 µg/Dosis Aerosol", cant: "1 Fco", ind: "2 puff c/6 h Inhalada por boca", via: "Inh", dur: "5 dias" },
        { name: "Salbutamol 8h", med: "SALBUTAMOL 100 µg/Dosis Aerosol", cant: "1 Fco", ind: "2 puff c/8 h Inhalada por boca", via: "Inh", dur: "5 dias" },
        { name: "Salbutamol 12h", med: "SALBUTAMOL 100 µg/Dosis Aerosol", cant: "1 Fco", ind: "2 puff c/12 h Inhalada por boca", via: "Inh", dur: "5 dias" },
        { name: "Amox/Clav 500", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "14 dias" },
        { name: "Amoxicilina 500", med: "Amoxicilina 500 mg", cant: "21 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "7 dias" },
        { name: "Amox/Clav 875", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
        { name: "Amox/Clav 875 (2)", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" }
    ]
};

export const DIAGNOSTICOS_COMUNES = {
    "NARIZ Y SENOS PARANASALES": [
        { label: "Rinitis alérgica", cie10: "J30.4" },
        { label: "Rinitis vasomotora", cie10: "J30.0" },
        { label: "Desviación del tabique nasal", cie10: "J34.2" },
        { label: "Rinosinusitis aguda", cie10: "J01.9" },
        { label: "Rinosinusitis crónica", cie10: "J32.9" },
        { label: "Rinofaringitis aguda (Resfriado común)", cie10: "J00" },
        { label: "Poliposis nasosinusal", cie10: "J33.9" },
        { label: "Hipertrofia de cornetes", cie10: "J34.3" },
        { label: "Vestibulitis nasal / Forúnculo", cie10: "J34.0" },
        { label: "Traumatismo superficial de la nariz", cie10: "S00.3" },
        { label: "Fractura nasal (huesos propios)", cie10: "S02.2" },
        { label: "Epistaxis", cie10: "R04.0" },
        { label: "Várices septales", cie10: "J34.8" },
        { label: "Hiposmia / Anosmia", cie10: "R43.0" },
        { label: "Cuerpo extraño en nariz", cie10: "T17.1" }
    ],
    "OÍDO": [
        { label: "Otitis media aguda", cie10: "H66.9" },
        { label: "Otitis media serosa", cie10: "H65.9" },
        { label: "Otitis media crónica", cie10: "H66.5" },
        { label: "Otitis externa aguda", cie10: "H60.5" },
        { label: "Tapón de cerumen", cie10: "H61.2" },
        { label: "Disfunción de Trompa de Eustaquio", cie10: "H69.9" },
        { label: "Perforación timpánica", cie10: "H72.9" },
        { label: "Tinnitus", cie10: "H93.1" },
        { label: "Hipoacusia neurosensorial bilateral", cie10: "H90.3" },
        { label: "Hipoacusia neurosensorial unilateral", cie10: "H90.4" },
        { label: "Presbiacusia", cie10: "H91.1" },
        { label: "Síndrome vestibular", cie10: "H81.9" },
        { label: "Vértigo Posicional Paroxístico Benigno (VPPB)", cie10: "H81.1" },
        { label: "Enfermedad de Ménière", cie10: "H81.0" },
        { label: "Cuerpo extraño en oído", cie10: "T16" }
    ],
    "FARINGE, LARINGE Y CUELLO": [
        { label: "Disfonía", cie10: "R49.0" },
        { label: "Faringitis aguda", cie10: "J02.9" },
        { label: "Faringitis crónica", cie10: "J31.2" },
        { label: "Amigdalitis aguda", cie10: "J03.9" },
        { label: "Amigdalitis crónica", cie10: "J35.0" },
        { label: "Reflujo faringolaríngeo", cie10: "K21.9" },
        { label: "Nódulos de cuerda vocal", cie10: "J38.2" },
        { label: "Pólipo de cuerda vocal", cie10: "J38.1" },
        { label: "Quiste de cuerda vocal", cie10: "J38.3" },
        { label: "Adenomegalia / Ganglio linfático", cie10: "R59.0" },
        { label: "Cuerpo extraño en garganta/faringe", cie10: "T17.2" }
    ],
    "PEDIATRÍA (Diagnósticos frecuentes en niños)": [
        { label: "Rinofaringitis aguda", cie10: "J00" },
        { label: "Hipertrofia de adenoides", cie10: "J35.2" },
        { label: "Hipertrofia de amígdalas y adenoides", cie10: "J35.3" },
        { label: "Otitis media aguda", cie10: "H66.9" },
        { label: "Otitis media serosa", cie10: "H65.9" },
        { label: "Cuerpo extraño en orificio nasal", cie10: "T17.1" },
        { label: "Cuerpo extraño en oído", cie10: "T16" },
        { label: "Frenillo lingual corto (Anquiloglosia)", cie10: "Q38.1" }
    ]
};

export const EXAM_TEMPLATES = {
    oido: [
        { label: "Normal", text: "CAE permeable, piel integra. Tímpano íntegro, nacarado, triángulo luminoso presente." },
        { label: "Tapón", text: "CAE obstruido 100% por cerumen impactado." },
        { label: "OMA", text: "Tímpano eritematoso, abombado, pérdida de triángulo luminoso." },
        { label: "OMS", text: "Tímpano íntegro, opaco/ámbar, niveles hidroaéreos." },
        { label: "OE", text: "CAE edematoso, secreción purulenta. Dolor tracción." }
    ],
    nariz: [
        { label: "Normal", text: "Fosas permeables. Mucosa rosada. Cornetes eutróficos. Tabique central." },
        { label: "Rinitis", text: "Mucosa pálida, cornetes hipertróficos, moco hialino." },
        { label: "Desv D", text: "Desviación septal obstructiva a DERECHA." },
        { label: "Desv I", text: "Desviación septal obstructiva a IZQUIERDA." }
    ],
    garganta: [
        { label: "Normal", text: "Orofaringe rosada. Amígdalas grado I. Úvula central." },
        { label: "Amig", text: "Amígdalas hipertróficas, eritematosas, exudado purulento." },
        { label: "RFL", text: "Edema de aritenoides, eritema retrocricoideo." }
    ]
};

export const CATALOGO_MEDICO = {
    "NARIZ Y SENOS PARANASALES (Adultos)": [
        {
            label: "Rinitis Alérgica (Estándar)", cie10: "J30.4",
            trat: [
                { med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
                { med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
                { med: "Rupatadina 10 mg (Rupatadina)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
                { med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" }
            ],
            indic: ""
        },
        {
            label: "Rinitis + Hipertrofia Cornetes / Desviación Septal", cie10: "J30.4",
            extraDiags: [{ code: "J34.3", desc: "Hipertrofia de Cornetes" }, { code: "J34.2", desc: "Desviación Septal" }],
            trat: [
                { med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
                { med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
                { med: "Cetirizina + Pseudoefedrina (Hisaler D)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
                { med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
                { med: "Tiras nasales", cant: "1 Caja", ind: "Colocar sobre dorso nasal (cada noche o durante ejercicio)", via: "TOP", dur: "30 días" }
            ],
            indic: ""
        },
        {
            label: "Rinosinusitis Aguda / Crónica", cie10: "J01.9",
            trat: [
                { med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
                { med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
                { med: "Rupatadina 10 mg (Rupatadina)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
                { med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
                { med: "Levofloxacino 750 mg (Ponaris)", cant: "3 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "3 dias" },
                { med: "Levofloxacino 500 mg (Ponaris)", cant: "7 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "7 dias" },
                { med: "Amoxicilina/Ac. Clavunico 1g (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (M-N)", via: "VO", dur: "10 dias" }
            ],
            indic: ""
        },
        {
            label: "Colapso Valvular Nasal", cie10: "J34.8",
            trat: [
                { med: "Tiras nasales (Breath Right/Wayra)", cant: "1 Caja", ind: "Cada noche o ejercicio", via: "TOP", dur: "30 días" },
                { med: "Lavados nasales", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "30 días" },
                { med: "Antihistamínico", cant: "10 Tab", ind: "1 tab c/24h", via: "VO", dur: "10 días" },
                { med: "Corticoide nasal", cant: "1 Fco", ind: "1 puff c/24h", via: "NAS", dur: "15 días" }
            ],
            indic: ""
        },
        {
            label: "Epistaxis / Várices Septales", cie10: "R04.0",
            trat: [
                { med: "Tetraciclina (Tetralan) ungüento", cant: "1 Tubo", ind: "1 aplic. c/12h", via: "TOP", dur: "7 días" },
                { med: "Loratadina 10 mg", cant: "7 Tab", ind: "1 tab c/24h", via: "VO", dur: "7 días" },
                { med: "Lavados nasales suaves", cant: "1 Kit", ind: "c/12h", via: "NAS", dur: "10 días" }
            ],
            indic: ""
        },
        {
            label: "Poliposis Nasosinusal", cie10: "J33.9",
            trat: [
                { med: "Lavados nasales (con budesonida opcional)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "30 días" },
                { med: "Budesonida (Rinosal B)", cant: "1 Fco", ind: "2 puff c/24h", via: "NAS", dur: "15 días" },
                { med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tab c/24h", via: "VO", dur: "5 días" },
                { med: "Antibiótico (Si sobreinfección)", cant: "1 Caja", ind: "Según indicación", via: "VO", dur: "7 días" }
            ],
            indic: ""
        }
    ],
    "OÍDO (Adultos)": [
        {
            label: "Otitis Externa (Infecciosa)", cie10: "H60.3",
            trat: [
                { med: "Ciprofloxacino + Hidrocortisona (Ciriax Otic)", cant: "1 Fco", ind: "3 gotas c/8h", via: "TOP", dur: "10 días" },
                { med: "Ac. Acético + Alcohol isopropílico", cant: "1 Fco", ind: "3 gotas c/8h (para secar/hongos)", via: "TOP", dur: "10 días" },
                { med: "Paracetamol o Zaldiar", cant: "10 Tab", ind: "Condicional a dolor", via: "VO", dur: "3 días" }
            ],
            indic: "No mojar el oído."
        },
        {
            label: "Otitis Media / Serosa / Disfunción Tubárica", cie10: "H65.9",
            trat: [
                { med: "Lavados nasales + Spray (Ryaltris/Nasonex)", cant: "1 Kit", ind: "c/8h + puff noche", via: "NAS", dur: "15 días" },
                { med: "Antihistamínico (Rupatadina/Cetirizina)", cant: "10 Tab", ind: "1 tab c/24h", via: "VO", dur: "10 días" },
                { med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tab c/24h", via: "VO", dur: "5 días" },
                { med: "Amoxicilina/Clavulánico 875mg (Si bacteriana)", cant: "14 Tab", ind: "1 tab c/12h", via: "VO", dur: "7-10 días" }
            ],
            indic: ""
        },
        {
            label: "Tinnitus / Hipoacusia Neurosensorial", cie10: "H93.1",
            trat: [
                { med: "Tratamiento nasal base (si componente tubárico)", cant: "-", ind: "Ver esquema nasal", via: "NAS", dur: "-" },
                { med: "Lipoflavonoides (Ringing Ears)", cant: "1 Fco", ind: "1 tab c/12-24h", via: "VO", dur: "15-30 días" },
                { med: "Clonazepam 0.5 mg", cant: "10 Tab", ind: "1/2 tab c/noche", via: "VO", dur: "10 días" },
                { med: "Prednisona (Si Hipoacusia Súbita)", cant: "-", ind: "Esquema descendente (50->20->5)", via: "VO", dur: "Variable" }
            ],
            indic: ""
        },
        {
            label: "Vértigo / Síndrome de Ménière", cie10: "H81.0",
            trat: [
                { med: "Betahistina (Microser) 16-24 mg", cant: "30 Tab", ind: "1 tab c/8h o c/12h", via: "VO", dur: "7-30 días" },
                { med: "Acetazolamida 250 mg", cant: "10 Tab", ind: "1 tab c/24h (8am) con un plátano diario", via: "VO", dur: "5-10 días" }
            ],
            indic: ""
        },
        {
            label: "Tapón de Cerumen", cie10: "H61.2",
            trat: [
                { med: "Otozambon", cant: "1 Fco", ind: "3 gotas c/8h (ablandar)", via: "TOP", dur: "5-7 días" },
                { med: "Aceite de almendras/glicerina", cant: "1 Fco", ind: "3 gotas c/24h (mantenimiento)", via: "TOP", dur: "30 días" }
            ],
            indic: ""
        }
    ],
    "FARINGE, LARINGE Y OTROS": [
        {
            label: "Rinofaringitis Aguda / Amigdalitis", cie10: "J03.9",
            trat: [
                { med: "Amoxicilina/Clavulánico 875mg o Azitromicina 500mg", cant: "1 Caja", ind: "Si es bacteriana", via: "VO", dur: "5-7 días" },
                { med: "Celecoxib o Ibuprofeno", cant: "10 Tab", ind: "1 tab c/12h o c/8h", via: "VO", dur: "3-5 días" },
                { med: "Anginovag spray", cant: "1 Fco", ind: "2 puff c/8h", via: "TOP", dur: "5 días" }
            ],
            indic: ""
        },
        {
            label: "Reflujo Faringolaríngeo (RFL) / Disfonía", cie10: "K21.9",
            trat: [
                { med: "Esomeprazol/Omeprazol 20-40 mg", cant: "30 Tab", ind: "1 tab 30 min antes del desayuno", via: "VO", dur: "30 días" },
                { med: "Tratamiento nasal (Si goteo postnasal)", cant: "-", ind: "Ryaltris + Rupatadina", via: "NAS", dur: "-" }
            ],
            indic: ""
        },
        {
            label: "Dolor Neuropático / Neuralgia", cie10: "M79.2",
            trat: [
                { med: "Amitriptilina 25 mg", cant: "21 Tab", ind: "1 tab c/24h (8 pm)", via: "VO", dur: "21 días" },
                { med: "Complejo B", cant: "1 Caja", ind: "Coadyuvante", via: "VO", dur: "15 días" }
            ],
            indic: ""
        }
    ],
    "PEDIATRÍA (Niños)": [
        {
            label: "Rinitis Alérgica (Leve)", cie10: "J30.4",
            trat: [
                { med: "Cloruro de Sodio (Neilmed/Rinobebe)", cant: "1 Fco", ind: "2-3 seg c/8h en cada fosa nasal (luego sonar nariz)", via: "NAS", dur: "30 días" },
                { med: "Loratadina 5mg/5ml (Jbe)", cant: "1 Fco", ind: "1-3 ml (según peso/edad) c/24h (8 pm)", via: "VO", dur: "7 días" },
                { med: "Tetraciclina (Tetralan) Ungüento", cant: "1 Tubo", ind: "1 aplic. en nariz c/12h (si hay vestibulitis)", via: "TOP", dur: "7 días" }
            ],
            indic: ""
        },
        {
            label: "Rinitis Alérgica (Mod-Sev) / Hipertrofia Adenoides", cie10: "J30.4",
            extraDiags: [{ code: "J35.2", desc: "Hipertrofia de Adenoides" }],
            trat: [
                { med: "Cloruro de Sodio (Neilmed/Rinomar)", cant: "1 Fco", ind: "3 seg c/8h en cada fosa nasal", via: "NAS", dur: "30 días" },
                { med: "Mometasona (Nasonex)", cant: "1 Fco", ind: "1-2 puff c/24h (noche)", via: "NAS", dur: "15-30 días" },
                { med: "Loratadina o Desloratadina (Jbe)", cant: "1 Fco", ind: "Dosis según peso, c/24h (8 pm)", via: "VO", dur: "7 días" },
                { med: "Argirol 2% (Opcional)", cant: "1 Fco", ind: "2 gotas c/12h (si hay adenoiditis)", via: "NAS", dur: "5 días" }
            ],
            indic: ""
        },
        {
            label: "Otitis Media Aguda", cie10: "H66.9",
            trat: [
                { med: "Amoxicilina (250mg/5ml Jbe)", cant: "1 Fco", ind: "Dosis ponderal c/8h", via: "VO", dur: "5-7 días" },
                { med: "Ibuprofeno/Paracetamol", cant: "1 Fco", ind: "Condicional a dolor/fiebre", via: "VO", dur: "3-5 días" },
                { med: "Lavados nasales (Neilmed/Rinomar)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "7 días" }
            ],
            indic: ""
        },
        {
            label: "Otitis Media Serosa / Ototubaritis", cie10: "H65.9",
            trat: [
                { med: "Amoxicilina/Ac. Clavulánico (Jbe)", cant: "1 Fco", ind: "Dosis ponderal c/8h", via: "VO", dur: "10 días" },
                { med: "Mometasona (Nasonex)", cant: "1 Fco", ind: "1 puff c/24h", via: "NAS", dur: "15 días" },
                { med: "Loratadina (Jbe)", cant: "1 Fco", ind: "c/24h", via: "VO", dur: "7 días" },
                { med: "Lavados nasales (Neilmed)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "15 días" }
            ],
            indic: ""
        },
        {
            label: "Rinosinusitis Aguda", cie10: "J01.9",
            trat: [
                { med: "Amoxicilina/Ac. Clavulánico (Jbe)", cant: "1 Fco", ind: "Dosis ponderal c/8h", via: "VO", dur: "10 días" },
                { med: "Mometasona", cant: "1 Fco", ind: "1 puff c/24h", via: "NAS", dur: "15 días" },
                { med: "Lavados nasales (Neilmed)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "10 días" }
            ],
            indic: ""
        },
        {
            label: "Rinofaringitis Aguda", cie10: "J00",
            trat: [
                { med: "Amoxicilina (Jbe)", cant: "1 Fco", ind: "c/8h", via: "VO", dur: "5 días" },
                { med: "Loratadina (Jbe)", cant: "1 Fco", ind: "c/24h", via: "VO", dur: "7 días" },
                { med: "Lavados nasales (Neilmed)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "5 días" }
            ],
            indic: ""
        }
    ]
};
