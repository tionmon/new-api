package setting

import (
	"encoding/json"
	"slices"
	"strings"

	"github.com/QuantumNous/new-api/common"
)

// GetGroupOrder returns the order users should see groups in.
//
// There is exactly one source of truth for it: the order the groups are written in
// the GroupRatio option, which is also the row order the admin group pricing page
// saves. A separate GroupOrder option once stored an override, but it could only ever
// be written alongside the row order it was meant to override, so it was removed
// rather than kept as a second truth that could drift.
//
// The order is read from the option's *string*, not from a map: encoding/json sorts
// a map's keys, which is precisely the order this is trying to recover.
func GetGroupOrder() []string {
	common.OptionMapRWMutex.RLock()
	raw := common.OptionMap["GroupRatio"]
	common.OptionMapRWMutex.RUnlock()

	keys := jsonObjectKeyOrder(raw)
	if keys == nil {
		return []string{}
	}
	return keys
}

// jsonObjectKeyOrder returns a JSON object's keys in the order they are written.
// encoding/json cannot express that through a map, so it walks the tokens instead.
// Anything malformed yields the keys read so far, which for this use is a safe
// partial order.
func jsonObjectKeyOrder(raw string) []string {
	decoder := json.NewDecoder(strings.NewReader(raw))

	token, err := decoder.Token()
	if err != nil {
		return nil
	}
	if delim, ok := token.(json.Delim); !ok || delim != '{' {
		return nil
	}

	keys := []string{}
	for decoder.More() {
		token, err = decoder.Token()
		if err != nil {
			return keys
		}
		key, ok := token.(string)
		if !ok {
			return keys
		}
		keys = append(keys, key)

		var value json.RawMessage
		if err := decoder.Decode(&value); err != nil {
			return keys
		}
	}
	return keys
}

// SortGroupsByDisplayOrder orders the given group names by the display order. Names
// the order does not mention keep their relative order and follow the mentioned ones.
func SortGroupsByDisplayOrder(groupNames []string) []string {
	order := GetGroupOrder()
	if len(order) == 0 || len(groupNames) == 0 {
		return groupNames
	}

	// A name the order repeats keeps its first position. A name the order does not
	// mention ranks past every configured position, so the stable sort leaves it where
	// it was, behind the mentioned ones.
	rank := make(map[string]int, len(order))
	for index, name := range order {
		if _, ok := rank[name]; !ok {
			rank[name] = index
		}
	}
	positionOf := func(name string) int {
		if position, ok := rank[name]; ok {
			return position
		}
		return len(order)
	}

	sorted := slices.Clone(groupNames)
	slices.SortStableFunc(sorted, func(a, b string) int { return positionOf(a) - positionOf(b) })
	return sorted
}
