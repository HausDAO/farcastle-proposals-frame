import * as yup from "yup";

export type FeildsFecord = Record<string, { spec: { optional: boolean } }>;

// export const getRequiredFieldsList = (formSchema: { fields: FeildsFecord }) =>
export const getRequiredFieldsList = (formSchema: yup.AnyObject) =>
  Object.keys(formSchema.fields).reduce((acc: string[], field) => {
    if (!formSchema.fields[field].spec.optional) {
      acc.push(field);
    }
    return acc;
  }, []);

export const getMetaFieldsList = (formSchema: yup.AnyObject) => {
  return {
    title: !!formSchema.fields.title,
    description: !!formSchema.fields.description,
    link: !!formSchema.fields.link,
  };
};
