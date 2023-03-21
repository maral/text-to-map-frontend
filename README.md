# Text To Map
Text To Map usiluje o lepší, strojově zpracovatelné využití částí vyhlášek s výčtem ulic a dalších lokací. Jde o rozšiřitelnou sadu konceptů a nástrojů, které zajistí hladký převod výčtu ulic a jejich rozsahů v lidsky srozumitelném jazyce do strojově zpracovatelného, uchopitelného formátu.

## Odkazy
- [text-to-map](https://github.com/maral/text-to-map) - knihovna pro generování JSON dat z vyhlášek (srdce projektu)

## Živě na webu
- [Spádové oblasti - Praha](https://mareklisy.cz/spadovosti-praha/)
- [Spádové oblasti - Česká Lípa](https://mareklisy.cz/spadovosti-praha/cl.html)

## Jak to začalo?
Ze strojově nezpracovatelných dat pražských spádových obvodů jsme vytvořili lidsky i strojově čitelný formát ("Street Markdown") velmi podobný tomu, co už dnes ve spádové vyhlášce hl. m. Prahy existuje. Většinu vyhlášky jsme pročistili a do tohoto formátu převedli a díky tomu je možné tato data dále vizualizovat a dále zpracovávat.

## K čemu taková data mohou sloužit?
Nabízí se řada využití těchto dat:
- odbor školství si zobrazí všechny spádové oblasti škol a může si v reálném čase vizualizovat možné změny
- embed mapy se spádovou oblastí školy na její webové stránky
- editace vyhláškových dat městskou částí přímo v mapové webové aplikaci, namísto editace ulic ve Wordu
- automatické propojení dat z registru obyvatel se spádovými oblastmi (což všechny městské části dnes dělají pro tisíce budoucích prvňáčků ručně)
- zobrazení demografických výhledů na dalších roky

## Co je ambicí tohoto projektu?
Hlavním zaměřením jsou spádové oblasti škol. Chceme v první fázi pracovat se stakeholdery a nadesignovat a vytvořit nástroje, které by umožnily výše zmiňované využití dat (např. zobrazení na mapě, propojení prvňáčků se spádovými školami atp.) V blízké budoucnosti budou spádovosti spravovány na jednom místě (v gesci MŠMT) přímo ve strojově zpracovatelném formátu a budou dostupné v podobě otevřených dat.

Dalším budoucím potenciálním cílem je rozšíření principu text-to-map a formátu Street Markdown pro další způsoby využití (viz níže).

## Street Markdown
Street Markdown je formát, který po vzoru značkovacího jazyka [Markdown](https://en.wikipedia.org/wiki/Markdown) má za cíl usnadnit psaní strukturovaných dat bez nutnosti učit se složité formátovací tagy nebo používat speciální znaky. Vznikl na základě [pražské spádové vyhlášky z roku 2021](https://www.praha.eu/file/3251117/vyhlaska_c._4.pdf) a snaží se být co nejkompatibilnější s již používaným formátem.

Street Markdown je dále možný rozšiřovat pro další případy použití - například protialkoholová vyhláška (do standardu by byla třeba přidat definice parků), tržní vyhláška, vyhláška o buskingu a další.

### Pravidla Street Markdownu

* **prázdné znaky a řádky**
    * veškeré po sobě jdoucí mezery jsou ignorovány a počítají se jako jedna mezera
    * prázdné řádky mají ve formátu speciální význam, několik prázdných řádků za sebou se ignoruje a počítá se jako jeden prázdný řádek
* **blok oblasti**
    * v případě SMD pro více obcí či městských částí je uvozen blok oblasti pomocí _názvu oblasti_, následuje prázdný řádek a poté libovolný počet _bloků škol_
    * _blok oblasti_ končí řádkem před _nadpisem oblasti_ následujícího _bloku obce_ nebo koncem souboru
* **název oblasti**
    * začíná znakem "#" následovaný mezerou a textovým řetězcem, který obsahuje přesný název obce
    * příklady:
       * \# Praha 1
       * \# Pelhřimov
       * \# Poděbrady
* **blok školy**
    * jde o souvislý blok řádků bez vynechaných řádků
    * bloky škol jsou od sebe odděleny jedním či více prázdnými řádky
* **název školy**
    * první řádek bloku řádků je název školy
    * libovolný neprázdný textový řetězec
* **definice ulice**
    * definice ulice obsahuje _jméno ulice_ a volitelně _specifikaci orientačních čísel_
    * pokud celá ulice patří do aktuálního bloku školy, pak se specifikace orientačních čísel neuvádí, uvede se pouze název ulice
    * název ulice se uvádí v plně rozvinutém tvaru
        * špatně: nám. Míru, Rašínovo nábř.
        * správně: náměstí Míru, Rašínovo nábřeží
    * jméno ulice a specifikace ulice je odděleno znaménkem minus (a volitelnými mezerami okolo pomlčky) - místo minus jsou přípustné i pomlčka a spojovník
* **specifikace orientačních čísel**
    * za sebou jdoucí výčet _rozsahů čísel_
    * _rozsahy čísel_ jsou odděleny čárkou a mezerou (", ") nebo spojkou " a "
* **rozsah čísel**
    * jako rozsah čísel se považuje specifikace, zda jde o _typ čísel_ (všechna, sudá či lichá čísla) a _rozsah_ od-do, a to v následujícím formátu:
        * **typ číse**l
            * všechna = "č."
            * lichá = "lichá č."
            * sudá = "sudá č."
            * čísla popisná = "č. p."
        * **rozsah čísel**
            * může jít o výčet (oddělený ", " nebo " a ") těchto možností:
                * a) číslo, např. 7
                * b) číslo-číslo, např. 2-66 (přípustné jsou pomlčka, spojovník, minus)
                * c) (od) "číslo" (a) výše, např. od 20 výše, 14 a výše, od 7 a výše
            * např. 1-9, 11, od 23 výše
* regexp pro validaci jednoho řádku s adresou:
     * _^([^ –,-]+([ –-][^ ,–-]+)*)( [–-] (lichá č.|sudá č.|č.|č. p.)( (\d+[a-zA-Z]? ?[–-] ?\d+[a-zA-Z]?|(od )?\d+[a-zA-Z]?( a)? výše|\d+[a-zA-Z]?)((, ?| ?a ?)(\d+[a-zA-Z]? ?[–-] ?\d+[a-zA-Z]?|(od )?\d+[a-zA-Z]?( a)? výše|\d+[a-zA-Z]?))*)?((, ?| ?a ?)(lichá č.|sudá č.|č.|č. p.)( (\d+[a-zA-Z]? ?[–-] ?\d+[a-zA-Z]?|(od )?\d+[a-zA-Z]?( a)? výše|\d+[a-zA-Z]?)((, ?| ?a ?)(\d+[a-zA-Z]? ?[–-] ?\d+[a-zA-Z]?|(od )?\d+[a-zA-Z]?( a)? výše|\d+[a-zA-Z]?))*)?)*)?$_

## Plán rozvoje aplikace

Plán vývoje máme v [Google dokumentu](https://docs.google.com/document/d/1sjGZ1A5HMstfswkfi0Ga_cqPYzA_yTKqIlUZTuGadqI/edit?usp=sharing).
