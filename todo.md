# VPWA TODO
1. [x] registrácia, prihlásenie a odhlásenie používateľa
    - [x] používateľ má meno a priezvisko, nickName a email
2. [x] používateľ vidí zoznam kanálov, v ktorých je členom
    - [x] pri opustení kanála, alebo trvalom vyhodení z kanála je daný kanál odobratý zo zoznamu
    - [x] pri pozvánke do kanála je daný kanál zvýraznený a topovaný
    - [x] v zozname môže cez používateľské rozhranie kanál vytvoriť, opustiť, a ak je správcom aj zrušiť
    - [x] dva typy kanálov - súkromný (private channel) a verejný kanál (public channel)
    - [x] správcom kanála je používateľ, ktorý kanál vytvoril
    - [ ] ak nie je kanál aktívny (nie je pridaná nová správa) viac ako 30 dní, kanál prestáva existovať (následne je možné použiť channelName kanála pre "nový" kanál)
3. [x] používateľ odosiela správy a príkazy cez "príkazový riadok", ktorý je "fixným" prvkom aplikácie. používateľ môže odoslať správu v kanáli, ktorého je členom
4. [x] vytvorenie komunikačného kanála (channel) cez príkazový riadok
    - [x] kanál môže vytvoriť ľubovolný používateľ cez príkaz /join channelName [private]
    - [x] do súkromného kanála môže pridávať/odoberať používateľov iba správca kanála cez príkazy /invite nickName a /revoke nickName
    - [x] do verejného kanála sa môže pridať ľubovolný používateľ cez príkaz /join channelName (ak kanál neexistuje, automaticky sa vytvorí)
    - [x] do verejného kanála môže člen kanála pozvať iného používateľa príkazom /invite nickName
    - [x] vo verejnom kanáli môže člen "vyhodiť" iného člena príkazom /kick nickName. ak tak spravia aspoň 3 členovia, používateľ má "trvalý" ban pre daný kanál. správca môže používateľa vyhodiť "natrvalo" kedykoľvek príkazom /kick nickName, alebo naopak "obnovit" používateľovi prístup do kanála cez príkaz /invite
    - [x] nickName ako aj channelName sú unikátne
    - [x] správca môže kanál zatvoriť/zrušiť príkazom /quit
5. [x] používateľ môže zrušiť svoje členstvo v kanáli príkazom /cancel, ak tak spraví správca kanála, kanál zaniká
6. [x] správu v kanáli je možné adresovať konkrétnemu používateľovi cez príkaz @nickname
    - [x] správa je zvýraznená danému používateľovi v zozname správ
7. [x] používateľ si môže pozrieť kompletnú históriu správ
    - [x] efektívny inifinite scroll
8. [ ] používateľ je informovaný o každej novej správe prostredníctvom notifikácie
    - [ ] notifikácia sa vystavuje iba ak aplikácia nie je v stave "visible" (pozrite quasar docu App Visibility)
    - [x] notifikácia obsahuje časť zo správy a odosielateľa
    - [x] používateľ si môže nastaviť, aby mu chodili notifikácie iba pre správy, ktoré sú mu adresované
9. [ ] používateľ si môže nastaviť stav (online, DND, offline)
    - [ ] stav sa zobrazuje používateľom
    - [x] ak je nastavený DND stav, neprichádzajú notifikácie
    - [x] ak je nastavený offline stav, neprichádzajú používateľovi správy, po prepnutí do online sú kanály automaticky aktualizované
10. [x] používateľ si môže pozrieť zoznam členov kanála (ak je tiež členom kanála) príkazom /list
11. [x] ak má používateľ aktívny niektorý z kanálov (nachádza sa v okne správ pre daný kanál) vidí v stavovej lište informáciu o tom, kto aktuálne píše správu (napr. Ed is typing)
     - [x] po kliknutí na nickName si môže pozrieť rozpísaný text v reálnom čase, predtým, ako ju odosielateľ odošle (každá zmena je viditeľná) :-)
   

   Potrebujeme vidiet stav ineho pouzivatela?