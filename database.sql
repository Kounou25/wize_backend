CREATE DATABASE company_db;
use company_db;

CREATE TABLE voyages (
    id_voyage SERIAL PRIMARY KEY,
    nomClient VARCHAR(200),
    phone VARCHAR(50) UNIQUE NOT NULL,
    ville_dep VARCHAR(100) NOT NULL,
    ville_arr VARCHAR(100) NOT NULL,
    date_dep DATE,
    nbr_place INTEGER NOT NULL,
    total_price FLOAT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messageries(
    id_messagerie SERIAL PRIMARY KEY,
    nom_expediteur VARCHAR(200) NOT NULL,
    phone_expediteur VARCHAR(50) NOT NULL,
    nom_destinataire VARCHAR(200) NOT NULL,
    phone_destinataire VARCHAR(50) NOT NULL,
    ville_dep VARCHAR(100) NOT NULL,
    ville_arr VARCHAR(100) NOT NULL,
    description_colis TEXT,
    poids FLOAT,
    prix FLOAT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);