import type { Verb } from '../types';

const rawVerbsData: string = `
cuire,bakken / bakte/bakten / gebakken
commencer,beginnen / begon/begonnen / begonnen zijn
comprendre,begrijpen / begreep/begrepen / begrepen
décrire,beschrijven / beschreef/beschreven / beschreven
décider,besluiten / besloot/besloten / besloten
exister,bestaan / bestond/bestonden / bestaan
plaire,bevallen / beviel/bevielen / bevallen zijn
bouger,bewegen / bewoog/bewogen / bewogen
prouver,bewijzen / bewees/bewezen / bewezen
visiter,bezoeken / bezocht/bezochten / bezocht
offrir,bieden / bood/boden / geboden
rester,blijven / bleef/bleven / gebleven zijn
casser,breken / brak/braken / gebroken
apporter,brengen / bracht/brachten / gebracht
penser,denken / dacht/dachten / gedacht
faire/mettre,doen / deed/deden / gedaan
porter,dragen / droeg/droegen / gedragen
boire,drinken / dronk/dronken / gedronken
plonger,duiken / dook/doken / gedoken
manger,eten / at/aten / gegeten
aller,gaan / ging/gingen / gegaan zijn
guérir,genezen / genas/genazen / genezen
donner,geven / gaf/gaven / gegeven
pendre,hangen / hing/hingen / gehangen
avoir,hebben / had/hadden / gehad
aider,helpen / hielp/hielpen / geholpen
s'appeler,heten / heette/heetten / geheten
tenir,houden / hield/hielden / gehouden
choisir,kiezen / koos/kozen / gekozen
regarder,kijken / keek/keken / gekeken
grimper,klimmen / klom/klommen / geklommen
venir,komen / kwam/kwamen / gekomen zijn
acheter,kopen / kocht/kochten / gekocht
recevoir,krijgen / kreeg/kregen / gekregen
pouvoir (capacité),kunnen / kon/konden / /
rire,lachen / lachte/lachten / gelachen
laisser,laten / liet/lieten / gelaten
lire,lezen / las/lazen / gelezen
mentir,liegen / loog/logen / gelogen
être couché,liggen / lag/lagen / gelegen
courir,lopen / liep/liepen / gelopen zijn
devoir (obligation),moeten / moest/moesten / /
pouvoir (permission),mogen / mocht/mochten / /
prendre,nemen / nam/namen / genomen
recevoir,ontvangen / ontving/ontvingen / ontvangen
rouler,rijden / reed/reden / gereden
crier/appeler,roepen / riep/riepen / geroepen
sentir (odorat),ruiken / rook/roken / geroken
donner en cadeau/verser,schenken / schonk/schonken / geschonken
tirer/arme,schieten / schoot/schoten / geschoten
sembler/briller,schijnen / scheen/schenen / geschenen
écrire,schrijven / schreef/schreven / geschreven
(s')effrayer,schrikken / schrok/schrokken / geschrokken
frapper/battre,slaan / sloeg/sloegen / geslagen
dormir,slapen / sliep/sliepen / geslapen
fermer,sluiten / sloot/sloten / gesloten
couper,snijden / sneed/sneden / gesneden
parler,spreken / sprak/spraken / gesproken
sauter,springen / sprong/sprongen / gesprongen
être debout,staan / stond/stonden / gestaan
voler (voleur),stelen / stal/stalen / gestolen
mourir,sterven / stierf/stierven / gestorven zijn
monter/s'élever,stijgen / steeg/stegen / gestegen zijn
repasser,strijken / streek/streken / gestreken
tirer,trekken / trok/trokken / getrokken
tomber,vallen / viel/vielen / gevallen zijn
saisir/attraper,vangen / ving/vingen / gevangen
se battre,vechten / vocht/vochten / gevochten
cacher,verbergen / verborg/verborgen / verborgen
interdire,verbieden / verbood/verboden / verboden
disparaître,verdwijnen / verdween/verdwenen / verdwenen zijn
oublier,vergeten / vergat/vergaten / vergeten
vendre,verkopen / verkocht/verkochten / verkocht
quitter,verlaten / verliet/verlieten / verlaten
perdre,verliezen / verloor/verloren / verloren
comprendre,verstaan / verstond/verstonden / verstaan
partir,vertrekken / vertrok/vertrokken / vertrokken zijn
trouver,vinden / vond/vonden / gevonden
voler (ailes),vliegen / vloog/vlogen / gevlogen
demander,vragen / vroeg/vroegen / gevraagd
laver,wassen / waste/wasten / gewassen
jeter/lancer,werpen / wierp/wierpen / geworpen
savoir,weten / wist/wisten / geweten
vouloir,willen / wilde/wou/wouden / gewild
gagner (loterie),winnen / won/wonnen / gewonnen
devenir,worden / werd/werden / geworden zijn
dire,zeggen / zei/zeiden / gezegd
envoyer,zenden / zond/zonden / gezonden
voir,zien / zag/zagen / gezien
être,zijn / was/waren / geweest zijn
chanter,zingen / zong/zongen / gezongen
s'asseoir,zitten / zat/zaten / gezeten
chercher,zoeken / zocht/zochten / gezocht
nager,zwemmen / zwom/zwommen / gezwommen
se taire,zwijgen / zweeg/zwegen / gezwegen
`;

export const verbList: Verb[] = rawVerbsData
  .trim()
  .split('\n')
  .map(line => {
    const [fr, nlPart] = line.split(',');
    // Use ' / ' as a separator to correctly handle preterite forms like 'kocht/kochten'.
    const nlChunks = nlPart.trim().split(' / ');

    const participleRaw = nlChunks[2] || '-';

    return {
      fr: fr.trim(),
      nl: {
        infinitive: nlChunks[0] || '-',
        preterite: nlChunks[1] || '-',
        // Handle cases where the participle is missing or represented by a '/'.
        participle: participleRaw === '/' ? '-' : participleRaw,
      },
    };
  });

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export const verbSeries: Verb[][] = chunk(verbList, 10);