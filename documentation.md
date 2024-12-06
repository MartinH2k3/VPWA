# Zadanie
Vytvorte progresívnu webovú aplikáciu na textovú komunikáciu v štýle IRC (Slack), ktorá komplexne rieši nižšie definované prípady použitia.
# Diagram fyzického dátového modelu
![Diagram fyzického dátového modelu](/final_uml.png)
# Návrhové rozhodnutia
## Odporúčané knižnice
### Quasar
Quasar je veľmi obsiahla knižnica, ktorá obsahuje veľa komponentov a funkcionalít, ktoré sa nám hodia. Medzi ne patria:
* komponenty pre UI
  * tlačidlá, vstupné polia,...
* Notifikácie
  * Jednoduché q.notify, ktoré sa zobrazuú keď používateľ používa aplikáciu
* PWA mód
  * jednoduché pretvorenie SPA na PWA
### Adonis
Z Adonis.js sme v projekte využili:
* autentifikácia/autorizácia
* Lucid ORM - migrácie, modely a controllers
* http server
### PostgreSQL
* relačná databáza využivaná cez Lucid ORM
## Externé knižnice
### Pinia
Na spravovanie stavov sme zvolili Piniu namiesto Vuex, nakoľko Vuex je deprecated a nebude podporovaný v budúcnosti.
### Vymazávanie neaktívnych kanálov
```npm install node-schedule```  
Použitá knižnica node-schedule, kvôli jednoduchej implementácii.  
Stačí zavolať schedule.scheduleJob('sek min hod deň_v_mesiaci mesiac_v_roku deň_v_týždni', funkcia()), kde nepoužité hodnoty nahradíme *.
# Snímky obrazoviek
## Prihlasovacia obrazovka
![Login](/screenshots/login.png)
## Konverzácia v kanáli
![Login](/screenshots/chatting.png)
## Pozvánka do kanála
![Login](/screenshots/invite.png)
## Zoznam členov kanála
![Login](/screenshots/members.png)
## Nastavenia
![Login](/screenshots/settings.png)