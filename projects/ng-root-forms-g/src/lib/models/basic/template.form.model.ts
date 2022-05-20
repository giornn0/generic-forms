export enum InputTypes {
  Input = "input",
  Date = "date",
  Select = "select",
  Checkboxes = "checkboxes",
  Textarea = "textarea",
  Filter = "filter",
  Zerofill = "zerofill",
  File = "file",
  Cuit = "cuit",
  Editor = "editor",
  Tags = "tags",
  URL = "url",
  ILForm = "inline-form",
}

export interface InputTemplate {
  name: string; //Nombre del input (mismo que se use en el campsValidation, también sera su id en el HTML)
  class: string; //"form-group col-sm-6" El 6 cambiarlo acorde a si se quire modificar el ancho del Input, por el momento pasar toda la clase
  type?: InputTypes; //Tipo de input, "input" (InputTypes.Input)
  label: string; //Texto del Label correspondiente al Input
  sublabel?: string; //Texto del Label correspondiente al Input
  required?: boolean; //Si es requerido esta opcion renderizada un asterisco(*)rojo ->false por defecto
  placeholder?: string; //Por defecto se utilizara el label
  icon?: string;
  prePendIcon?: string;
  appendIcon?: string;
  prePendText?: string;
  appendText?: string;
  zerofill?: number;
  incorrectMessage?: string;
  hidden?: boolean;
  typeinput?: "text" | "password" | "number";
  //Select and Checkboxes type options
  optionsValueAccess?: string; //Se encesitara pasar una string que sera la key de acceso al valor que tendra cada opcion (estas key tienen que existir en el array que se pasa como opciones)
  optionsDescriptionAccess?: string; //Se encesitara pasar una string que sera la key de acceso a la descripcion que se renderizara en el select
  //Checkboxes options
  disposition?: "horizontal" | "vertical";
  //Filter type options
  filters?: InputFiltro[];
  forSelection?: EquivalentInput;
  autoFocus?:boolean;
  forQuantity?: boolean;
  titleAccess?: string;
  descriAccess1?: string;
  descriAccess2?: string;
  selectedTitle?: string;
  //Alignment Options
  center?: boolean;
  right?: boolean;
  //File Options
  accepts?: string;
  multiple?: boolean;
  previewImg?: boolean;
  repoTitle?: string;
  //commons
  nullable?: boolean;
  requiredState?: boolean;
  //Inline Form;
  plusLabel?: string;
  openForm?: boolean;
  emptyLabel?: string;

  step?: number;
  min?: number;
  max?: number;
}
export interface InputFiltro {
  name: string;
  class: string;
  type: string;
  label: string;
}
export interface EquivalentInput {
  [x: string]: string;
}

export interface FrontMultiFiles{
  fileName:string;
  fileUrl: string;
  fileData?: FormData;
  upload?:boolean;
}
/*IMPORTANTE RECORDAR que este InputTemplate se utiliza como un Array de Arrays, armando una matriz de InputTemplates
Esto se dejo asi para poder tener mayor control sobre determinadas filas del formulario, aunque tranquilamente se puede dejar todo en un mismo array, 
las diferentes filas se armaran automaticamente con el tamaño de las col
*/

/*ADEMAS cabe recalcar el uso del campsValidation, es este el que genera los ReactiveForm del lado de jsvascript,asi que si en el InputTemplate 
se manda un name que no exista como key en el campsValidation, habra errores en el renderizado del componente. 
Cada key de campsValidation debe corresponder al siguiente ejemple
*/

interface campsValidation {
  //Campo seria el name del campTemplate, sera el nombre del control del form
  campo: [
    {
      value: null; //Aca se puede setear el valor inicial (si se esta editando pasarlo por un objetoForEdit que automaticamente actualiza el valor)
      disabled: false; //Si el input estao no disabled al momento de iniciar el formulario
    },
    [
      Validators, //Pasar un array de Validators para validar los datos del input (siempre hacer uso de estos, es mucho muy importante)
      Validators
    ]
  ];
}

interface Validators {}
