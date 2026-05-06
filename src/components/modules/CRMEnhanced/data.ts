export const getTriggerLabel = (t: string) => {
  switch (t) {
    case "stage_change":
      return "Promena faze";
    case "deal_created":
      return "Novi deal";
    case "days_inactive":
      return "Neaktivnost";
    case "score_above":
      return "Score iznad";
    default:
      return t;
  }
};

export const getActionLabel = (a: string) => {
  switch (a) {
    case "move_stage":
      return "Premesti fazu";
    case "assign_to":
      return "Dodeli";
    case "send_email":
      return "Pošalji email";
    case "add_tag":
      return "Dodaj tag";
    case "set_score":
      return "Postavi score";
    default:
      return a;
  }
};

export const emptyForm = {
  name: "",
  trigger: "stage_change",
  condition: "",
  action: "move_stage",
  actionData: "",
  isActive: true,
};
