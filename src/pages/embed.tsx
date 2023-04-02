import { GetStaticProps } from "next";
import { MunicipalitySlugs, SchoolSlugs } from "@/types/data";
import { getMunicipalitySlugsList, getSchoolSlugsMap } from "@/utils/dataCache";
import { PageType } from "@/types/page";
import { ChangeEvent, useMemo, useState } from "react";
import { getDefaultParams } from "@/utils/defaultParams";
import { Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import Menu from "@/components/MapPage/Menu";
import Link from "next/link";

export default function EmbedPage({
  schoolSlugs,
  municipalitySlugs,
}: MunicipalityPageProps) {
  if (schoolSlugs.length === 0 || municipalitySlugs.length === 0) {
    return (
      <div className="alert alert-warning">
        Error: nepodařilo se načíst školy nebo obce/městské části.
      </div>
    );
  }

  const defaults = getDefaultParams(PageType.School);

  const [pageType, setPageType] = useState(PageType.School);
  const [school, setSchool] = useState(schoolSlugs[0].schools[0].slug);
  const [municipality, setMunicipality] = useState(municipalitySlugs[0].slug);
  const [showSearch, setShowSearch] = useState(defaults.showSearch);
  const [showControls, setShowControls] = useState(defaults.showControls);
  const [showMenu, setShowMenu] = useState(defaults.showMenu);
  const [fixedZoom, setFixedZoom] = useState(false);
  const [zoom, setZoom] = useState(15);
  const [fixedCenter, setFixedCenter] = useState(false);
  const [center, setCenter] = useState<[string, string]>([
    "50.08743",
    "14.42128",
  ]);
  const [fixedColor, setFixedColor] = useState(false);
  const [color, setColor] = useState("#ff0000");

  const handlePageTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const pageType = e.target.value as PageType;
    setPageType(pageType);
    const defaults = getDefaultParams(pageType);
    setShowSearch(defaults.showSearch);
    setShowControls(defaults.showControls);
    setShowMenu(defaults.showMenu);
  };

  const isValidCoordinate = (value: string): boolean => {
    const coordinate = parseFloat(value);
    return !isNaN(coordinate) && coordinate >= -180 && coordinate <= 180;
  };

  const isValidHexColor = (color: string): boolean => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  };

  const url = createUrl(
    pageType,
    school,
    municipality,
    showSearch,
    showControls,
    showMenu,
    fixedZoom,
    zoom,
    fixedCenter,
    center,
    fixedColor,
    color
  );

  const [iframeUrl, setIframeUrl] = useState(url);

  const refreshIframe = () => {
    setIframeUrl(url);
  };

  return (
    <Container className="mt-5 mb-5">
      <Menu />

      <Link href="/" className="btn btn-light">
        Zpět na hlavní mapu
      </Link>

      <h1 className="mb-5 mt-4">Vložte si mapu školy nebo MČ na svůj web</h1>

      <h2 className="mt-5 mb-3">Nastavení mapy</h2>

      <Form className="mt-5">
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Pro koho chcete mapu vytvořit?</Form.Label>
              <Form.Check
                type="radio"
                label="Škola"
                id={PageType.School}
                value={PageType.School}
                checked={pageType === PageType.School}
                onChange={handlePageTypeChange}
              />
              <Form.Check
                type="radio"
                label="Městská část"
                id={PageType.Municipality}
                value={PageType.Municipality}
                checked={pageType === PageType.Municipality}
                onChange={handlePageTypeChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            {pageType === PageType.School && (
              <Form.Group>
                <Form.Label>Vyberte školu</Form.Label>
                <Form.Select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                >
                  {schoolSlugs.map((municipality, index) => (
                    <optgroup key={index} label={municipality.municipalityName}>
                      {municipality.schools.map(({ name, slug }) => (
                        <option key={slug} value={slug}>
                          {name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {pageType === PageType.Municipality && (
              <Form.Group>
                <Form.Label>Vyberte městskou část</Form.Label>
                <Form.Select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                >
                  {municipalitySlugs.map(({ name, slug }) => (
                    <option key={slug} value={slug}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <Form.Group controlId="showSearch">
              <Form.Check
                type="checkbox"
                label="Zobrazit vyhledávání"
                checked={showSearch}
                onChange={(e) => setShowSearch(e.target.checked)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <Form.Group controlId="showControls">
              <Form.Check
                type="checkbox"
                label="Zobrazit ovládání mapy (přiblížení / oddálení)"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <Form.Group controlId="showMenu">
              <Form.Check
                type="checkbox"
                label="Zobrazit menu"
                checked={showMenu}
                onChange={(e) => setShowMenu(e.target.checked)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <Form.Group controlId="fixedZoom">
              <Form.Check
                type="checkbox"
                label="Vlastní výchozí přiblížení"
                checked={fixedZoom}
                onChange={(e) => setFixedZoom(e.target.checked)}
              />
            </Form.Group>
          </Col>
        </Row>
        {fixedZoom && (
          <Row className="mb-2">
            <Col>
              <Form.Group controlId="zoom">
                <Form.Label>
                  Zvolené přiblížení: <kbd>{zoom}</kbd>
                </Form.Label>
                <Row>
                  <Col xs="auto">
                    <code>0 = celý svět</code>
                  </Col>
                  <Col>
                    <Form.Range
                      min={0}
                      max={20}
                      step={0.5}
                      value={zoom}
                      onChange={(e) => setZoom(parseInt(e.target.value))}
                    />
                  </Col>
                  <Col xs="auto">
                    <code>20 = detailní záběr ulice</code>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        )}

        <Row className="mb-2">
          <Col>
            <Form.Group controlId="fixedCenter">
              <Form.Check
                type="checkbox"
                label="Vlastní střed mapy"
                checked={fixedCenter}
                onChange={(e) => setFixedCenter(e.target.checked)}
              />
            </Form.Group>
          </Col>
        </Row>
        {fixedCenter && (
          <Row className="mb-2">
            <Col>
              <Form.Group controlId="latitude">
                <Form.Label>Zeměpisná šířka (latitude)</Form.Label>
                <Form.Control
                  type="text"
                  value={center[0]}
                  onChange={(e) => setCenter([e.target.value, center[1]])}
                  isInvalid={!isValidCoordinate(center[0])}
                />
                <Form.Control.Feedback type="invalid">
                  Zadejte prosím platné číslo GPS souřadnice.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="longitude">
                <Form.Label>Zeměpisná délka (longitude)</Form.Label>
                <Form.Control
                  type="text"
                  value={center[1]}
                  onChange={(e) => setCenter([center[0], e.target.value])}
                  isInvalid={!isValidCoordinate(center[1])}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid longitude.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        )}

        {pageType === PageType.School && (
          <Row className="mb-2">
            <Col>
              <Form.Group controlId="fixedColor">
                <Form.Check
                  type="checkbox"
                  label="Vlastní barva značek školy a adresních míst"
                  checked={fixedColor}
                  onChange={(e) => setFixedColor(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        )}
        {pageType === PageType.School && fixedColor && (
          <Row className="mb-2">
            <Col xs="auto">
              <Form.Control
                type="color"
                id="exampleColorInput"
                onChange={(e) => setColor(e.target.value)}
                value={color}
                title="Vyberte barvu"
              />
            </Col>
            <Col xs="auto">
              <InputGroup>
                <InputGroup.Text>#</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={color.slice(1)}
                  onChange={(e) => setColor(`#${e.target.value}`)}
                  isInvalid={!isValidHexColor(color)}
                />
                <Form.Control.Feedback type="invalid">
                  Zadejte prosím platné číslo GPS souřadnice.
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
          </Row>
        )}
      </Form>

      <EmbedCode url={url} />

      <button className="mt-4 btn btn-primary" onClick={refreshIframe}>
        Aktualizovat náhled
      </button>

      <Row className="mt-2">
        <Col xs={12} xl={8}>
          <iframe width="100%" height="500px" src={iframeUrl} />
        </Col>
      </Row>
    </Container>
  );
}

const EmbedCode = ({ url }: { url: string }) => {
  return (
    <div className="card">
      <div className="card-header text-bg-primary">
        Kód pro vložení do stránky
      </div>
      <div className="card-body">
        <pre className="mb-0 text-wrap">
          &lt;iframe src="{url}" width="100%" height="600px"
          frameborder="0"&gt;&lt;/iframe&gt;
        </pre>
      </div>
    </div>
  );
};

const createUrl = (
  pageType: PageType,
  school: string,
  municipality: string,
  showSearch: boolean,
  showControls: boolean,
  showMenu: boolean,
  fixedZoom: boolean,
  zoom: number,
  fixedCenter: boolean,
  center: [string, string],
  fixedColor: boolean,
  color: string
): string => {
  const baseUrl = useMemo(() => {
    const origin = "http://localhost:3000"; //"https://www.spadovostpraha.cz";
    // typeof window !== "undefined" && window.location.origin
    //   ? window.location.origin
    //   : "";
    return origin;
  }, []);

  const path =
    pageType === PageType.School ? `/s/${school}` : `/m/${municipality}`;

  const params = new URLSearchParams();
  params.set("search", showSearch ? "1" : "0");
  params.set("controls", showControls ? "1" : "0");
  params.set("menu", showMenu ? "1" : "0");
  if (fixedZoom) {
    params.set("zoom", zoom.toString());
  }
  if (fixedCenter) {
    params.set("lat", center[0].toString());
    params.set("lon", center[1].toString());
  }
  if (fixedColor) {
    params.set("color", color.slice(1));
  }
  return `${baseUrl}${path}?${params.toString()}`;
};

interface MunicipalityPageProps {
  schoolSlugs: SchoolSlugs;
  municipalitySlugs: MunicipalitySlugs;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const schoolSlugs = getSchoolSlugsMap();
  const municipalitySlugs = getMunicipalitySlugsList();

  return {
    props: {
      schoolSlugs,
      municipalitySlugs,
    },
  };
};
