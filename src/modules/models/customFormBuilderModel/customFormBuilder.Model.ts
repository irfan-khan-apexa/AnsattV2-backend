import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

export interface CustomDocumentAttributes {
  id?: string;
  company_code: string;

  doc_name: string;

  sections?: Record<string, any> | null;
  section_list?: any[] | null;

  logo_size?: number | null;
  logo?: string | null;

  pos?: {
    x: number;
    y: number;
  } | null;

  font_family?: string | null;
  page_border?: boolean;
  is_draft?: boolean;

  generated_by: number;
}

export type CustomDocumentCreationAttributes = Optional<
  CustomDocumentAttributes,
  | "id"
  | "sections"
  | "section_list"
  | "logo_size"
  | "logo"
  | "pos"
  | "font_family"
  | "page_border"
  | "is_draft"
>;

export class CustomDocument
  extends Model<
    CustomDocumentAttributes,
    CustomDocumentCreationAttributes
  >
  implements CustomDocumentAttributes
{
  public id!: string;
  public company_code!: string;

  public doc_name!: string;

  public sections!: Record<string, any> | null;
  public section_list!: any[] | null;

  public logo_size!: number | null;
  public logo!: string | null;

  public pos!: {
    x: number;
    y: number;
  } | null;

  public font_family!: string | null;
  public page_border!: boolean;
  public is_draft!: boolean;

  public generated_by!: number;
}

CustomDocument.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    doc_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sections: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    section_list: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    logo_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pos: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    font_family: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "sans-serif",
    },

    page_border: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    is_draft: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    generated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "custom_documents",
    timestamps: true,
  }
);

export default CustomDocument;