import { SetStateAction, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Pagination from "@mui/material/Pagination";

const itemsPerPage = 5;
const items = [
  "Item 1",
  "Item 2",
  "Item 3",
  "Item 4",
  "Item 5",
  "Item 6",
  "Item 7",
  "Item 8",
  "Item 9",
  "Item 10",
]; // Replace with your items

function PaginatedList() {
  const [page, setPage] = useState(1);

  const handleChange = (_event: any, value: SetStateAction<number>) => {
    setPage(value);
  };

  return (
    <div>
      <List>
        {items.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
        ))}
      </List>
      <Pagination
        count={Math.ceil(items.length / itemsPerPage)}
        page={page}
        onChange={handleChange}
      />
    </div>
  );
}

export default PaginatedList;
