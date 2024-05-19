import { ComponentProps, useEffect, useRef, useState } from "react"
import { Form } from "react-bootstrap"
import { Dj } from "../../util/types";
import { db } from "../../util/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Typeahead } from "react-bootstrap-typeahead";
import { docToRawType } from "../../store/util";

type Props = {
    onDjSelect: (dj: Dj | null) => void;
}

type DjRecord = Record<string, { dj: Dj, label: string }>;

export const DjSearchSelect = ({onDjSelect}: Props) => {

    const [matchedDjs, setMatchedDjs] = useState<DjRecord[]>([]);

    useEffect(() => {
        (async ()=>{
            const djCollectionRef = collection(db, "djs");
            const q = query(djCollectionRef);
            const querySnapshot = await getDocs(q);
            const suggestionResults: DjRecord[] = [];
            querySnapshot.forEach((doc) => {
                const dj = docToRawType<Dj>(doc);
                const record: DjRecord = {[`${doc.id}`]: { dj: dj, label: dj.name ?? "unknown" }};
                suggestionResults.push(record)
            });
            setMatchedDjs(suggestionResults);
        })()
    }, []);

    // This component is full of sin...
    const ref: ComponentProps<typeof Typeahead>['ref'] = useRef(null);

    return <Form onSubmit={(e) => { e.preventDefault(); } }>
        <Form.Group>
            <Typeahead
                id="dj-search-typeahead"
                ref={ref}
                options={matchedDjs}
                labelKey={(option) => { 
                    const dj = Object.values(option)[0].dj;
                    return `${dj.name} (${dj.discord_username})`
                }}
                placeholder="Search DJ"
                onChange={e => { 
                    const dj = Object.values(e[0])[0].dj;
                    onDjSelect(dj);
                    ref.current?.clear()
                }}
                selected={undefined}
                size="lg"
            />
        </Form.Group>
    </Form>
}