package setting

import (
	"encoding/json"
	"slices"
	"strings"
	"sync"

	"github.com/QuantumNous/new-api/common"
)

// groupOrder is the display order of groups, edited in the admin group pricing page.
// It is presentational only: it never affects billing, the default group, or the
// auto group routing priority, which is governed by autoGroups.
var groupOrder = []string{}
var groupOrderMutex sync.RWMutex

// GetGroupOrder returns the order users should see groups in: the configured
// order, or — until an admin saves one — the order the groups are written in the
// GroupRatio option, which is the row order of the admin group pricing table.
//
// The fallback matters: the table writes GroupRatio in row order, so that order is
// what the admin is looking at. Without it the table's order would mean nothing
// until someone pressed save, and users would get the alphabetically sorted order
// that encoding/json produces for a map.
func GetGroupOrder() []string {
	groupOrderMutex.RLock()
	configured := slices.Clone(groupOrder)
	groupOrderMutex.RUnlock()

	if len(configured) > 0 {
		return configured
	}
	return groupOrderFromGroupRatio()
}

// groupOrderFromGroupRatio reads the GroupRatio option's key order. It is a string
// in the option map precisely because the written order carries information that a
// map (and therefore any re-marshal of one) would lose.
func groupOrderFromGroupRatio() []string {
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

func GroupOrder2JSONString() string {
	groupOrderMutex.RLock()
	defer groupOrderMutex.RUnlock()

	// The frontend validates this field as a JSON array of group names, so it must
	// never serialize to null: a nil slice (never configured, or a literal "null"
	// stored earlier) would make saving the group pricing page fail silently.
	if groupOrder == nil {
		return "[]"
	}

	jsonBytes, err := common.Marshal(groupOrder)
	if err != nil {
		common.SysLog("error marshalling group order: " + err.Error())
		return "[]"
	}
	return string(jsonBytes)
}

func UpdateGroupOrderByJSONString(jsonString string) error {
	var order []string
	if err := common.Unmarshal([]byte(jsonString), &order); err != nil {
		return err
	}

	groupOrderMutex.Lock()
	defer groupOrderMutex.Unlock()
	groupOrder = order
	return nil
}

// SortGroupsByDisplayOrder orders the given group names by the configured display
// order. Names the order does not mention keep their relative order and follow the
// mentioned ones.
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
