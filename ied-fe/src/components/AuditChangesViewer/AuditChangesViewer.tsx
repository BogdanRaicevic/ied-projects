import type { IChange } from "@ied-shared/types/diff";
import { common, green, grey, red } from "@mui/material/colors";

interface Props {
  changes: IChange[];
}

const renderValue = (value: any) => {
  if (typeof value === "object" && value !== null) {
    return (
      <pre style={{ margin: 0, display: "inline" }}>
        {JSON.stringify(value)}
      </pre>
    );
  }
  if (value === undefined || value === null || value === "") {
    return <em>(prazno)</em>;
  }
  return <strong>{String(value)}</strong>;
};

export const AuditChangesViewer: React.FC<Props> = ({ changes }) => {
  if (!changes || changes.length === 0) {
    return <span>Nema promena.</span>;
  }

  return (
    <div>
      {changes.map((change, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          {(() => {
            // Check the 'kind' of change to decide how to render it
            switch (change.kind) {
              // This is the special case for your 'komentar' field
              case "T":
                return (
                  <div>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      Komentar je izmenjen:
                    </p>
                    <div
                      style={{
                        border: `1px solid ${grey[300]}`,
                        padding: "8px",
                        borderRadius: "4px",
                        backgroundColor: common.white,
                        whiteSpace: "pre-wrap", // This preserves newlines and spaces
                        wordBreak: "break-word",
                      }}
                    >
                      {change.diff?.map((part, i) => {
                        const style = {
                          backgroundColor: part.added
                            ? green[100]
                            : part.removed
                              ? red[100]
                              : "transparent",
                          color: part.added
                            ? green[900]
                            : part.removed
                              ? red[900]
                              : "inherit",
                          textDecoration: part.removed
                            ? "line-through"
                            : "none",
                        };
                        return (
                          <span key={i} style={style}>
                            {part.value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              case "A":
                return (
                  <div>
                    <p style={{ margin: 0 }}>
                      U listi <strong>{change.property}</strong> desile su se
                      sledeće promene:
                    </p>
                    <div
                      style={{
                        paddingLeft: "20px",
                        borderLeft: `2px solid ${grey[300]}`,
                      }}
                    >
                      {change.arrayChanges?.map((arrayChange) => (
                        <div key={arrayChange.id}>
                          {arrayChange.type === "added" && (
                            <p>
                              <span
                                style={{
                                  backgroundColor: green[100],
                                  color: green[900],
                                  padding: "2px 4px",
                                }}
                              >
                                Dodato:
                              </span>{" "}
                              <strong>
                                {" "}
                                {JSON.stringify(arrayChange.item)}
                              </strong>
                            </p>
                          )}
                          {arrayChange.type === "removed" && (
                            <p>
                              <span
                                style={{
                                  backgroundColor: red[100],
                                  color: red[900],
                                  padding: "2px 4px",
                                }}
                              >
                                Obrisano:
                              </span>{" "}
                              <strong>
                                <strong>
                                  {" "}
                                  {JSON.stringify(arrayChange.item)}
                                </strong>
                              </strong>
                            </p>
                          )}
                          {arrayChange.type === "modified" && (
                            <div>
                              <p>
                                ✏️ Izmenjeno: {arrayChange.item._id}{" "}
                                {arrayChange.item.ime}{" "}
                                {arrayChange.item.prezime}
                              </p>
                              <div style={{ paddingLeft: "20px" }}>
                                <AuditChangesViewer
                                  changes={arrayChange.changes!}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case "E":
                return (
                  <div>
                    <strong>{change.property}</strong>{" "}
                    <span
                      style={{
                        backgroundColor: red[100],
                        color: red[900],
                        textDecoration: "line-through",
                        padding: "2px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      {renderValue(change.oldValue)}
                    </span>
                    {" → "}
                    <span
                      style={{
                        backgroundColor: green[100],
                        color: green[900],
                        padding: "2px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      {renderValue(change.newValue)}
                    </span>
                  </div>
                );
              case "N":
                return (
                  <div>
                    <strong>{change.property}</strong>{" "}
                    <span
                      style={{
                        backgroundColor: green[100],
                        color: green[900],
                        padding: "2px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      {renderValue(change.newValue)}
                    </span>
                  </div>
                );
              case "D":
                return (
                  <div>
                    <strong>{change.property}</strong>{" "}
                    <span
                      style={{
                        backgroundColor: red[100],
                        color: red[900],
                        textDecoration: "line-through",
                        padding: "2px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      {renderValue(change.oldValue)}
                    </span>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </div>
      ))}
    </div>
  );
};
