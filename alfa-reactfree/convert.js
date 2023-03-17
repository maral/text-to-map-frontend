const data = require('./p10data.json');

const schools = [
  {
    name: 'Základní škola Eden, Praha 10, Vladivostocká 1035/6, příspěvková organizace',
    position: [50.0688133, 14.4746447]
  },
  {
    name: 'Základní škola Karla Čapka, Praha 10, Kodaňská 658/16, příspěvková organizace',
    position: [50.0709039, 14.4570228]
  },
  {
    name: 'Základní škola Solidarita, Praha 10, Brigádníků 510/14, příspěvková organizace',
    position: [50.0744667, 14.5008536]
  },
  {
    name: 'Základní škola, Praha 10, Břečťanová 2919/6, příspěvková organizace',
    position: [50.0547372, 14.4968042]
  },
  {
    name: 'Základní škola, Praha 10, Gutova 1987/39, příspěvková organizace',
    position: [50.0705872, 14.4925556]
  },
  {
    name: 'Základní škola, Praha 10, Hostýnská 2100/2, příspěvková organizace',
    position: [50.0798339, 14.4953281]
  },
  {
    name: 'Základní škola, Praha 10, Jakutská 1210/2, příspěvková organizace',
    position: [50.0721322, 14.4726611]
  },
  {
    name: 'Základní škola, Praha 10, Nad Vodovodem 460/81, příspěvková organizace',
    position: [50.0824739, 14.4985208]
  },
  {
    name: 'Základní škola, Praha 10, Olešská 2222/18, příspěvková organizace',
    position: [50.0642128, 14.5113125]
  },
  {
    name: 'Základní škola, Praha 10, Švehlova 2900/12, příspěvková organizace',
    position: [50.0586931, 14.5085783]
  },
  {
    name: 'Základní škola, Praha 10, U Roháčových kasáren 1381/19, příspěvková organizace',
    position: [50.0706558, 14.4667233]
  },
  {
    name: 'Základní škola, Praha 10, U Vršovického nádraží 950/1, příspěvková organizace',
    position: [50.0667953, 14.4478722]
  },
  {
    name: 'Základní škola, Praha 10, V Rybníčkách 1980/31, příspěvková organizace',
    position: [50.0709686, 14.5062819]
  }
];

const schoolsData = data.map((schoolAddresses, index) => ({
  name: schools[index].name,
  position: {
    lat: schools[index].position[0],
    lng: schools[index].position[1]
  },
  addresses: schoolAddresses
}));

const result = [
  {
    districtName: 'Praha 10',
    schools: schoolsData
  }
];

console.log(JSON.stringify(result));
