
var maxMin

//setup colors
var nanColor = '#bcbcbc'   
var percentColors = [
    { pct: 0, color: { r: 0xc1, g: 0xe7, b: 0xff } },
    { pct: 100, color: { r: 0x00, g: 0x4c, b: 0x6d }},
 ];
  
(function() {

    const createTilemapGrouping = json => {
        return new Promise((resolve, reject) => {
            try {
                const xmlns = 'http://www.w3.org/2000/svg'
                const size = 50
                const gap = 2
                const counties = [...new Set(json.map(d => d.county_ru))]

                const svg = document.createElementNS(xmlns, 'svg')
                svg.setAttributeNS(null, 'viewbox', `0 0 ${size * 17} ${size * 10}`)
                svg.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMid meet')

                json.forEach(tile => {
                    const { id, code, lat, lon, label, name_ru, county_ru,value } = tile

                    //param for grouping
                    const countyIndex = counties.sort().findIndex(d => d === county_ru)

                    const rect = document.createElementNS(xmlns, 'rect')
                    rect.setAttributeNS(null, 'width', size - gap)
                    rect.setAttributeNS(null, 'height', size - gap)
                    rect.classList.add(`county-${countyIndex}`)
                    rect.classList.add('region')
                    rect.dataset.id = id
                    rect.dataset.code = code
                    rect.dataset.region = name_ru
                    rect.dataset.county = county_ru

                    const text = document.createElementNS(xmlns, 'text')
                    text.setAttributeNS(null, 'x', size / 2 - gap / 2)
                    text.setAttributeNS(null, 'y', size / 5 * 3 - gap / 2)
                    text.textContent = label

                    const region = document.createElementNS(xmlns, 'g')
                    region.setAttributeNS(null, 'transform', `matrix(1 0 0 1 ${lon * size} ${lat * size})`)
                    region.setAttributeNS(null, 'text-anchor', 'middle')
                    region.setAttributeNS(null, 'font-family', 'sans-serif')
                    region.setAttributeNS(null, 'font-size', size / 4)
                    region.appendChild(rect)
                    region.appendChild(text)

                    svg.appendChild(region)
                })

                resolve(svg)

            } catch (error) {
                reject(error)
            }
        })
    }


    const createTilemapGradient = json => {
        return new Promise((resolve, reject) => {
            try {
                const xmlns = 'http://www.w3.org/2000/svg'
                const size = 50
                const gap = 2

                const svg = document.createElementNS(xmlns, 'svg')
                svg.setAttributeNS(null, 'viewbox', `0 0 ${size * 17} ${size * 10}`)
                svg.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMid meet')

                json.forEach(tile => {
                    const { id, code, lat, lon, label, name_ru, county_ru, value } = tile
                    const rect = document.createElementNS(xmlns, 'rect')
                    rect.setAttributeNS(null, 'width', size - gap)
                    rect.setAttributeNS(null, 'height', size - gap)
                    if(value == '-'){ 
                        rect.setAttributeNS(null, "fill", nanColor);
                    } else {
                        rect.setAttributeNS(null, "fill", getColorForPercentage((value/maxMin.max) *100)); 
                    }

                    rect.classList.add('region')
                    rect.dataset.id = id
                    rect.dataset.code = code
                    rect.dataset.region = name_ru
                    rect.dataset.county = county_ru

                    const text = document.createElementNS(xmlns, 'text')
                    text.setAttributeNS(null, 'x', size / 2 - gap / 2)
                    text.setAttributeNS(null, 'y', size / 5 * 3 - gap / 2)
                    text.textContent = label

                    const region = document.createElementNS(xmlns, 'g')
                    region.setAttributeNS(null, 'transform', `matrix(1 0 0 1 ${lon * size} ${lat * size})`)
                    region.setAttributeNS(null, 'text-anchor', 'middle')
                    region.setAttributeNS(null, 'font-family', 'sans-serif')
                    region.setAttributeNS(null, 'font-size', size / 4)
                    region.appendChild(rect)
                    region.appendChild(text)

                    svg.appendChild(region)
                })
                resolve(svg)
            } catch (error) {
                reject(error)
            }
        })
    }


    const createLegend = json => {
        return new Promise((resolve, reject) => {
            try {
                const xmlns = 'http://www.w3.org/2000/svg'
                const size = 50
                const gap = 2

                const svg = document.createElementNS(xmlns, 'svg')
                svg.setAttributeNS(null, 'preserveAspectRatio', 'xMinYMax meet')
                svg.classList.add('svgLegend')

                for (var i = 0, length = 100; i < length; i++) {

                    const rect = document.createElementNS(xmlns, 'rect')
                    rect.setAttributeNS(null, 'width', 2)
                    rect.setAttributeNS(null, 'height', 20)
                    rect.setAttributeNS(null, "fill", getColorForPercentage(i)) //gradient    
                    rect.setAttributeNS(null, 'x', 1+i*2)
                    rect.setAttributeNS(null, 'y', 1)
                    svg.appendChild(rect)
                }

                const textMin = document.createElementNS(xmlns, 'text')
                textMin.setAttributeNS(null, 'x', 0)
                textMin.setAttributeNS(null, 'y', 40)
                textMin.setAttributeNS(null, 'font-family', 'sans-serif')
                textMin.setAttributeNS(null, 'font-size', 12)
                textMin.textContent = nFormatter(maxMin.min,0)
                svg.appendChild(textMin)

                const textMax = document.createElementNS(xmlns, 'text')
                textMax.setAttributeNS(null, 'x', 175)
                textMax.setAttributeNS(null, 'y', 40)
                textMax.setAttributeNS(null, 'font-family', 'sans-serif')
                textMax.setAttributeNS(null, 'font-size', 12)
                textMax.textContent = nFormatter(maxMin.max,0)
                svg.appendChild(textMax)
                resolve(svg)
            } catch (error) {
                reject(error)
            }
        })
    }

    const getTable = dataset => {
        const table = document.createElement('table')

        for (key in dataset) {
            if (key === 'id') continue

            const name = document.createElement('td')
            name.innerText = key

            const value = document.createElement('td')
            value.innerText = dataset[key]

            const row = document.createElement('tr')
            row.appendChild(name)
            row.appendChild(value)

            table.appendChild(row)
        }

        return table
    }

    const handlerOver = popup => {
        return event => {
            const { target } = event

            if (!target.classList.contains('region')) return

            const table = getTable(target.dataset)
            popup.appendChild(table)

            const popupRect = popup.getBoundingClientRect()
            const regionRect = target.getBoundingClientRect()

            const x = regionRect.left
            const y = regionRect.top - popupRect.height

            popup.style.transform = `translate(${x}px, ${y}px)`
            popup.classList.add('active')
        }
    }

    const handlerOut = popup => {
        return () => {
            popup.classList.remove('active')
            popup.innerHTML = null
        }
    }

    const start = async url => {
        try {
            const response = await fetch(url)
            
            const json = await response.json()
            initGlobalVariables(json)
            const tilemap = await createTilemapGradient(json)
            const legend = await createLegend(json)

            const popup = document.createElement('div')
            popup.classList.add('popup')

            tilemap.addEventListener('mouseover', handlerOver(popup), false)
            tilemap.addEventListener('mouseout', handlerOut(popup), false)

            const body = document.querySelector('body')

            const legendDiv = document.createElement('div')
            legendDiv.classList.add('boxLegend')
            legendDiv.appendChild(legend)
            body.appendChild(legendDiv)

            const tileDiv = document.createElement('div')
            tileDiv.classList.add('boxTile')
            tileDiv.append(tilemap)
            body.appendChild(tileDiv)

            body.appendChild(popup)

        } catch (error) {
            console.error(error)
        }
    }

    start('./turizm.json')
})()


function nFormatter(num, digits) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: " тыс" },
      { value: 1e6, symbol: " млн" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
    const item = lookup.findLast(item => num >= item.value);
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
  }

function findMinMax(key, json) {
    var filteredListWithoutNan =  json.filter(element => element.value !== "-");
    const datas = filteredListWithoutNan.map((node) => node[key]);
    return {
      min: Math.min(...datas),
      max: Math.max(...datas),
    }
  }

  var getColorForPercentage = function(pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {

            break;
        }
    }

    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };

    console.log(pct);
    console.log(percentColors[i].pct);
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
};

  
function initGlobalVariables (json) {
    console.log(findMinMax('value', json));
    maxMin = findMinMax('value', json)  
}
