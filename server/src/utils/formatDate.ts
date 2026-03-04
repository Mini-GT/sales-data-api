export default function getFormattedDate(isoString: Date) {
  const date = new Date(isoString);

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return formattedDate;
}
