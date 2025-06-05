## Stap 1: Game Design - Pac-Man: De Jacht op de Bolletjes

### 1.1 Conceptualisering

- **Genre:** Dit wordt een actie/puzzelgame, trouw aan het origineel.
- **Hoofddoel:** Het hoofddoel is om alle bolletjes (pellets) op het speelveld op te eten, terwijl je de geesten ontwijkt. Grote bolletjes (power pellets) maken de geesten tijdelijk kwetsbaar, zodat Pac-Man ze kan opeten.
- **Doelgroep:** Fans van retro-games, casual gamers, en iedereen die een leuke, uitdagende arcade-ervaring zoekt.

### 1.2 Ontwerp Documentatie

- **Titel van het spel:** Pac-Man: De Jacht op de Bolletjes (of gewoon Pac-Man voor de eenvoud)
- **Spelmechanica:**
  - De speler bestuurt Pac-Man met de pijltjestoetsen (omhoog, omlaag, links, rechts).
  - Pac-Man beweegt door een doolhof.
  - Het doel is om alle kleine bolletjes op te eten.
  - Er zijn ook grote bolletjes (power pellets) die, wanneer opgegeten, de geesten tijdelijk blauw maken en kwetsbaar.
  - Wanneer Pac-Man een kwetsbare geest opeet, krijgt de speler extra punten en keert de geest terug naar het 'spookhuis' in het midden om opnieuw te spawnen.
  - Als een geest Pac-Man aanraakt terwijl hij niet kwetsbaar is, verliest de speler een leven.
  - De speler begint met een bepaald aantal levens (bijvoorbeeld 3).
  - Het spel eindigt wanneer alle bolletjes zijn opgegeten (winst) of wanneer de speler al zijn levens verliest (verlies).
  - Er is een scoresysteem. Het opeten van kleine bolletjes geeft punten, grote bolletjes meer, en geesten nog meer (oplopend per opgegeten geest na een power pellet).
- **Visuele stijl:** Pixel-art stijl, klassieke Pac-Man kleuren (geel voor Pac-Man, verschillende kleuren voor de geesten, blauw voor kwetsbare geesten, witte bolletjes), een donker doolhof.
- **Sound Design:**

  - Typische Pac-Man achtergrondmuziek (herhalend 'waka waka' geluid tijdens het eten van bolletjes).
  - Geluidseffecten voor:
    - Het opeten van een bolletje.
    - Het opeten van een power pellet.
    - Het opeten van een geest.
    - Pac-Man die gepakt wordt door een geest.
    - Een nieuw leven beginnen.
    - Game over.
    - Niveau voltooid.

## Stap 2: Ontwikkeling - Coderen en Versiebeheer

### 2.1 Het spel coderen

- **Technologieën:** HTML (voor de structuur en het canvas), CSS (voor styling), JavaScript (voor de game logica). We kunnen p5.js gebruiken voor tekenen op het canvas en het beheren van animaties, wat het makkelijker maakt.
- **Structuur:**
  - `index.html`: De hoofd HTML-pagina met het canvas.
  - `style.css`: CSS-bestand voor de styling.
  - `script.js`: Het hoofd JavaScript-bestand waar de game logica in komt te staan.
- **Kerncomponenten (in script.js of aparte bestanden):**

  - **Game State Management:** Variabelen voor de huidige score, aantal levens, de status van het spel (bijvoorbeeld 'start', 'spelen', 'game over'), etc.
  - **Canvas en Tekenen:** Gebruik maken van het HTML5 canvas om het doolhof, Pac-Man, geesten, en bolletjes te tekenen. Met p5.js is dit eenvoudiger.
  - **Doolhof Representatie:** Een 2D array of een vergelijkbare datastructuur om het doolhof op te slaan. Cijfers kunnen verschillende elementen representeren (0: lege ruimte, 1: muur, 2: klein bolletje, 3: groot bolletje, etc.).
  - **Pac-Man Object/Klasse:** Bevat eigenschappen zoals positie (x, y), snelheid, richting, aantal levens, score. Methoden voor beweging, botsingsdetectie met muren en bolletjes.
  - **Ghost Object/Klasse:** Bevat eigenschappen zoals positie (x, y), snelheid, richting, status (normaal, kwetsbaar, terugkeren naar spookhuis). Methoden voor beweging (volgens een bepaalde AI), botsingsdetectie met muren en Pac-Man. Elke geest kan een net iets andere bewegingslogica hebben om hun karakter te simuleren.
  - **Bolletjes Object/Klasse:** Kan een lijst van posities zijn waar bolletjes zich bevinden.
  - **Botsingsdetectie:** Functies om te controleren of Pac-Man botst met muren, bolletjes, of geesten.
  - **Spel Loop:** Een functie die continu wordt aangeroepen (bijvoorbeeld met `requestAnimationFrame` of de game loop functionaliteit van p5.js) om de game state te updaten (beweging, botsingen, score) en het scherm opnieuw te tekenen.
  - **Invoerhantering:** Luisteren naar toetsenbord events om Pac-Man te besturen.
  - **Score en Levens:** Logica om de score bij te houden, levens te verminderen bij botsing met een niet-kwetsbare geest, en game over te detecteren.
  - **Power Pellet Logica:** De geesten tijdelijk van status veranderen en hun uiterlijk aanpassen na het opeten van een power pellet.
  - **Geluid:** Gebruik maken van de Web Audio API of een bibliotheek zoals p5.sound om geluidseffecten af te spelen.

- **Commentaar:** Zorg ervoor dat je code voldoende commentaar heeft om uit te leggen wat verschillende delen doen, vooral de complexere logica zoals de geest AI of de botsingsdetectie.

### 2.2 Versiebeheer

- **Classroom GitHub Repository:** Maak gebruik van de toegewezen repository.
- **Regelmatige Commits:** Commit je code regelmatig. Elke keer dat je een functionele verbetering, bugfix, of significant nieuw onderdeel toevoegt, maak je een commit.
- **Zinvolle Commit Berichten:** Gebruik duidelijke en beknopte commit berichten die beschrijven wat er in die commit is veranderd. Bijvoorbeeld: "Implementeer Pac-Man beweging", "Voeg botsingsdetectie met muren toe", "Werk score-systeem bij", "Fix bug waarbij geesten vastliepen".

## Stap 3: Testen - Kwaliteitsborging

### 3.1 Maken van testplannen

- **Documentatie:** Maak een document (bijvoorbeeld een PDF of Markdown-bestand) met je testplan.
- **Wat te testen:**
  - **Functionaliteit:**
    - Werkt Pac-Man's beweging correct in alle richtingen?
    - Kan Pac-Man niet door muren heen?
    - Eet Pac-Man bolletjes op en verdwijnen ze?
    - Wordt de score correct bijgewerkt bij het opeten van bolletjes en geesten?
    - Werken de power pellets zoals verwacht (geesten worden blauw en kwetsbaar)?
    - Worden geesten correct opgegeten als ze kwetsbaar zijn en keren ze terug naar het spookhuis?
    - Verliest Pac-Man een leven bij botsing met een niet-kwetsbare geest?
    - Werkt het game over scherm bij het verliezen van alle levens?
    - Werkt het spel einde scherm bij het opeten van alle bolletjes?
    - Werken de tunnels aan de zijkanten correct?
    - Bewegen de geesten op een redelijke manier (volgens hun AI)?
  - **Gebruikersinterface/Ervaring:**
    - Is het speelveld duidelijk zichtbaar?
    - Worden de score en resterende levens duidelijk weergegeven?
    - Zijn de geluidseffecten en muziek passend?
    - Is de besturing responsief?
  - **Prestaties:**
    - Draait het spel soepel (geen lag)?
    - Werkt het op verschillende browsers (indien van toepassing)?
- **Testgevallen:** Definieer specifieke stappen om bepaalde functionaliteiten te testen. Bijvoorbeeld: "Loop met Pac-Man naar een muur om te controleren of hij stopt." "Eet een power pellet en controleer of de geesten blauw worden." "Laat Pac-Man botsen met een niet-kwetsbare geest en controleer of een leven wordt afgetrokken."
- **Verwachte Resultaten:** Beschrijf wat er zou moeten gebeuren bij elk testgeval.

### 3.2 Peer testen

- **Uitvoeren:** Laat een ander team je game spelen en de testgevallen uit je testplan doorlopen.
- **Feedback:** Vraag om feedback over:

  - De functionaliteit van het spel.
  - Eventuele bugs of onverwacht gedrag.
  - Hoe leuk en speelbaar het spel is.
  - Suggesties voor verbeteringen.

    3.3 Testrapport

- **Documentatie:** Stel een testrapport samen.
- **Inhoud:**

  - **Samenvatting:** Beschrijf kort het testproces, wie er heeft getest, en wanneer.
  - **Geteste Functionaliteiten:** Vermeld welke onderdelen van het spel zijn getest.
  - **Gevonden Issues/Bugs:** Maak een lijst van alle problemen die zijn gevonden, inclusief hoe je ze kunt reproduceren.
  - **Feedback en Suggesties:** Vermeld alle ontvangen feedback en suggesties van het testteam.
  - **Geplande Wijzigingen:** Beschrijf welke wijzigingen je van plan bent door te voeren op basis van de testresultaten en feedback.

    3.4 Proces voor codebeoordeling (codereview)

- **Voorbereiding:** Zorg ervoor dat je code goed georganiseerd is, commentaar heeft en push het naar de GitHub repository.
- **Uitleg:** Wees klaar om aan het team dat de review doet uit te leggen:
  - **Codestructuur:** Hoe je bestanden zijn georganiseerd, welke klassen of functies er zijn, en hoe ze samenwerken.
  - **Belangrijkste Functies:** De logica achter de kernmechanismen, zoals beweging, botsingen, geest AI, power pellets.
  - **Ontwerppatronen:** Als je specifieke patronen hebt gebruikt (bijvoorbeeld een game loop, observer pattern), leg uit waarom en hoe.
- **Ontvang Feedback:** Wees open voor suggesties over codekwaliteit, efficiëntie, leesbaarheid en mogelijke bugs.

## Stap 4: Evaluatie - Reflectie en Verbetering

### 4.1 Proces evaluatie

- **Team Discussie:** Bespreek met je teamleden hoe het ontwikkelproces verliep.
- **Wat ging goed?** Welke aspecten van het project verliepen vlot? Welke keuzes pakten goed uit?
- **Welke uitdagingen?** Met welke problemen ben je geconfronteerd (technisch, samenwerking, tijd)?
- **Hoe overkomen?** Hoe heb je deze uitdagingen aangepakt en opgelost? Wat heb je ervan geleerd?

### 4.2 Evaluatie van het eindproduct

- **Beoordeling:** Beoordeel je voltooide game kritisch.
- **Functionaliteit:** Werkt alles zoals gepland in het ontwerpdocument en na het testen? Zijn er nog onopgeloste bugs?
- **Gebruikerservaring:** Is het spel leuk om te spelen? Is het uitdagend maar niet frustrerend? Is de besturing intuïtief?
- **Technische kwaliteit:** Is de code schoon, efficiënt en makkelijk te begrijpen? Is er sprake van 'spaghetti code'? Kun je de code makkelijk uitbreiden?

### 4.3 Evaluatierapport

- **Documentatie:** Maak een evaluatierapport.
- **Inhoud:**
  - **Inleiding:** Korte introductie van het project.
  - **Proces Evaluatie:** Samenvatting van de discussie over het ontwikkelproces (sterke punten, uitdagingen, oplossingen).
  - **Product Evaluatie:** Beoordeling van het eindproduct (functionaliteit, UX, technische kwaliteit).
  - **Belangrijkste Conclusies:** Wat zijn de belangrijkste lessen die je uit dit project hebt geleerd?
  - **Suggesties voor Toekomstige Verbeteringen:** Welke functies of verbeteringen zou je aan het spel willen toevoegen als je meer tijd had? Bijvoorbeeld, meerdere niveaus, verschillende geest AI, bonus items, etc.

## Stap 5: Oplevering en Demonstratie - Presentatie van je Werk

### 5.1 Product oplevering

- **Demonstratie Klaar:** Zorg ervoor dat je de game makkelijk kunt opstarten en demonstreren. Dit kan door de HTML-pagina in een browser te openen.
- **GitHub Repository:** Zorg ervoor dat je GitHub repository up-to-date is met de definitieve code. Geef je leraar toegang.

### 5.2 Team Presentatie

- **Gezamenlijke Presentatie:** Beide teamleden moeten de game kunnen presenteren en uitleggen.
- **Functionaliteit Uitleggen:** Laat zien hoe het spel werkt, hoe je speelt, de verschillende statussen (normaal, kwetsbare geesten), en hoe je wint of verliest.
- **Code Uitleggen:** Ga door je code en leg de structuur, belangrijke functies, en de logica achter de game-elementen uit. Dit is waar je kunt laten zien hoe je de uitdagingen hebt opgelost en welke keuzes je hebt gemaakt.
