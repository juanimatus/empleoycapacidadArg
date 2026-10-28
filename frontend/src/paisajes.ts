/** Fotos del fondo de la portada, en public/paisajes/. Imágenes destacadas de Wikimedia Commons, con su crédito. */
export interface Paisaje {
  src: string;
  lugar: string;
  autor: string;
  licencia: string;
  url: string;
}

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

export const PAISAJES: Paisaje[] = [
  {
    src: "paisajes/hornocal.webp",
    lugar: "Serranía de Hornocal, Jujuy",
    autor: "Havardtl",
    licencia: "CC BY 4.0",
    url: `${COMMONS}Serran%C3%ADa_de_Hornocal_up_close_near_Humahuaca.jpg`,
  },
  {
    src: "paisajes/llao-llao.webp",
    lugar: "Península Llao Llao, Río Negro",
    autor: "Fernando",
    licencia: "CC BY-SA 4.0",
    url: `${COMMONS}Llao_Llao_Peninsula.jpg`,
  },
  {
    src: "paisajes/perito-moreno.webp",
    lugar: "Glaciar Perito Moreno, Santa Cruz",
    autor: "Luca Galuzzi",
    licencia: "CC BY-SA 2.5",
    url: `${COMMONS}Perito_Moreno_Glacier_Patagonia_Argentina_Luca_Galuzzi_2005.JPG`,
  },
  {
    src: "paisajes/ushuaia.webp",
    lugar: "Valle Carbajal, Tierra del Fuego",
    autor: "Godot13",
    licencia: "CC BY-SA 4.0",
    url: `${COMMONS}ARG-2016-Aerial-Tierra_del_Fuego_(Ushuaia)%E2%80%93Valle_Carbajal_01.jpg`,
  },
  {
    src: "paisajes/mar-del-plata.webp",
    lugar: "Playa La Perla, Mar del Plata",
    autor: "Ezarate",
    licencia: "CC BY-SA 4.0",
    url: `${COMMONS}BalnearioAlfonsina-LaPerlaMDP-feb2017.jpg`,
  },
];
